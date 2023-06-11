import { Octokit } from "@octokit/core";

const octokit = new Octokit({ auth: process.env.AUTH_TOKEN });

async function getMessage() {
  const repoNames = await _getRepoNames();
  const countMap = await _getPRCountMap(repoNames);
  return _getFormattedMsg(countMap);
}
async function _getRepoNames() {
  // if your ora has more than 100 repos, you need to change this value
  const PER_PAGE = 100;
  const { data } = await octokit.request("GET /orgs/{org}/repos", {
    org: process.env.ORG,
    per_page: PER_PAGE,
  });
  return data.map((v) => v.name);
}
async function _getPRCountMap(repoNames) {
  if (!repoNames.length) return;
  const countMap = {};
  const assigneerList = await Promise.all(
    repoNames.map((repoName) => getRepoAsssigneers(repoName))
  );
  const filteredList = assigneerList.map((data) =>
    data
      .flat()
      .map(({ login }) => login)
      .filter(Boolean)
  );
  filteredList.flat().forEach((login) => {
    countMap[login] = (countMap[login] || 0) + 1;
  });
  return countMap;
}
async function getRepoAsssigneers(repoName) {
  const { data } = await octokit.request("GET /repos/{owner}/{repo}/pulls", {
    owner: process.env.ORG,
    repo: repoName,
  });
  return data.map((v) => v?.requested_reviewers);
}
function _getFormattedMsg(data) {
  const introMsg =
    "🌞 굿모닝 좋은 아침 🌞\n💪 오늘자 리뷰 할당 현황 알려드려요!\n\n";
  const outTroMsg =
    "\n\n😉 유의사항\n* 당일 오전 9시 이전에 요청한 리뷰는 당일 오후 2시까지 리뷰 완료해주세요!\n* 리뷰가 늦어질 시 리뷰 요청자에게 DM으로 미리 알려주는 센스~!\n* 일부 인원에게 많은 리뷰가 가지 않게 골고루 리뷰를 걸어주세요\n\n코드리뷰 가이드 https://www.notion.so/thealphaprime/20ce2f42ca0f4511baa38c9aec6bdf1f";

  const sortedEntries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const formattedCountMap = sortedEntries.map(
    ([key, value]) => `- ${key}: ${value}`
  );
  return introMsg + formattedCountMap.join("\n") + outTroMsg;
}

export default { getMessage };
