const vorpal = require("vorpal")();
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const times = require("lodash/times");

export const RED = "\x1b[31m";
export const YELLOW = "\x1b[33m";
export const GREEN = "\x1b[32m";

interface IArgs {
  url?: string;
  formFactor?: "mobile" | "desktop" | undefined;
}

interface IInitialArgs extends IArgs {
  count?: number;
}

interface ILighthouseConfig {
  output: string;
  onlyCategories: string[];
  port: number;
  formFactor: "mobile" | "desktop" | undefined;
  useThrottling: boolean;
  screenEmulation: {
    mobile: boolean;
  }
}

export const getScoreColor = (score: number): string => {
  if (score < 50) return "\x1b[31m";
  if (score < 90) return "\x1b[33m";
  return "\x1b[32m";
}

export const getLighthouseConfig = (
    formFactor: "mobile" | "desktop" | undefined,
    chrome: { port: number },
  ): ILighthouseConfig => ({
    output: "json",
    onlyCategories: ["performance"],
    port: chrome.port,
    formFactor,
    useThrottling: formFactor === "mobile",
    screenEmulation: {
      mobile: formFactor === "mobile",
    }
});

export const logHeader = (args: IArgs) => {
  const urlOutput = `\x1b[32m${args.url || "localhost:3000"}\x1b[0m`;
  const formFactorOutput = `\x1b[32m${args.formFactor || "mobile"}\x1b[0m`;
  console.log(`Running lighthouse test on ${urlOutput} - ${formFactorOutput}`);
}

const needsHttpsAppend = (url: string): boolean =>
  !url.includes("http") && !url.includes("localhost");

const needsHttpAppend = (url: string): boolean =>
  !url.includes("http") && url.includes("localhost");

export const formatArgs = (args: any): IArgs => {
  let url = args.url || "localhost:3000";
  if (needsHttpsAppend(url)) url = `https://${url}`;
  if (needsHttpAppend(url)) url = `http://${url}`;
  return {
    url,
    formFactor: args?.formFactor || "mobile",
  };
}

export const formatScore = (score: number): number => Math.round(score * 100);

const startLighthouseTest = async (args: IArgs): Promise<number> => {
  const { url, formFactor } = args;
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const runnerResult = await lighthouse(url, getLighthouseConfig(formFactor, chrome));
  await chrome.kill();
  return formatScore(runnerResult.lhr.categories.performance.score);
};

const runLighthouseTests = async (args: IInitialArgs) => {
    const filteredArgs = formatArgs(args);
    let count = args.count || 5;
    let total = 0;

    logHeader(filteredArgs);

    for (let i = 0; i < count; i++) {
      const score = await startLighthouseTest(filteredArgs);
      const scoreOutput = `${getScoreColor(score)}${score}\x1b[0m`;
      total += score;
      console.log(`${i + 1} of ${count} - ${scoreOutput}`);
    }
    const totalOutput = `${getScoreColor(total / count)}${total / count}\x1b[0m`;
    console.log(`Average score: ${totalOutput}`);
}

// Program
vorpal.delimiter("scorn").show();

vorpal
  .command("run [url] [formFactor] [count]", "Runs lighthouse against local")
  .action(runLighthouseTests);