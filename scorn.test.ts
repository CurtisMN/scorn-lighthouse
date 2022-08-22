import { formatArgs, formatScore, logHeader } from './scorn';
import {
  getLighthouseConfig,
  getScoreColor,
  GREEN,
  RED,
  YELLOW
} from "./scorn";

describe("Scorn", () => {
  it("getScoreColor() - returns proper color", () => {
    expect(getScoreColor(20)).toBe(RED);
    expect(getScoreColor(30)).toBe(RED);
    expect(getScoreColor(40)).toBe(RED);

    expect(getScoreColor(60)).toBe(YELLOW);
    expect(getScoreColor(70)).toBe(YELLOW);
    expect(getScoreColor(80)).toBe(YELLOW);

    expect(getScoreColor(91)).toBe(GREEN);
    expect(getScoreColor(95)).toBe(GREEN);
    expect(getScoreColor(100)).toBe(GREEN);
  })

  it ("getLighthouseConfig() - constructs lighthouse options", () => {
    const resultMobile = {
      output: 'json',
      onlyCategories: ['performance'],
      port: 3000,
      formFactor: "mobile",
      useThrottling: true,
      screenEmulation: {
        mobile: true,
      }
     };
    const resultDesktop = {
      output: 'json',
      onlyCategories: ['performance'],
      port: 3000,
      formFactor: "desktop",
      useThrottling: false,
      screenEmulation: {
        mobile: false,
      }
     };

     expect(getLighthouseConfig("mobile", { port: 3000 }))
       .toEqual(resultMobile);
     expect(getLighthouseConfig("desktop", { port: 3000 }))
       .toEqual(resultDesktop);
  })

  it ("logHeader() - the header is logged correctly", () => {
    console.log = jest.fn();
    const expectedResult1 = "Running lighthouse test on \x1b[32mhttp://localhost:3000\x1b[0m - \x1b[32mmobile\x1b[0m"
    const expectedResult2 = "Running lighthouse test on \x1b[32mhttps://you.com\x1b[0m - \x1b[32mdesktop\x1b[0m"

    logHeader({ url: "http://localhost:3000", formFactor: "mobile" });
    expect(console.log).toHaveBeenCalledWith(expectedResult1);

    logHeader({ url: "https://you.com", formFactor: "desktop" });
    expect(console.log).toHaveBeenCalledWith(expectedResult2);
  })

  it ("formatArgs() - adds https", () => {
    const args = { url: "www.you.com", formFactor: "mobile" };
    const expectedResult = { url: "https://www.you.com", formFactor: "mobile" };
    expect(formatArgs(args))
      .toEqual(expectedResult);
  })

  it ("formatArgs() - adds default url of http://localhost:3000", () => {
    const args = { formFactor: "mobile" };
    const expectedResult = { url: "http://localhost:3000", formFactor: "mobile" };
    expect(formatArgs(args))
      .toEqual(expectedResult);
  })

  it ("formatArgs() - adds default formFactor of mobile", () => {
    const args = {};
    const expectedResult = { url: "http://localhost:3000", formFactor: "mobile" };
    expect(formatArgs(args))
      .toEqual(expectedResult);
  })

  it ("formatScore() - calculates the correct score", () => {
    expect(formatScore(0.1)).toBe(10);
    expect(formatScore(0.35)).toBe(35);
    expect(formatScore(1)).toBe(100);
  })
})