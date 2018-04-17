/**
 * @file
 * Regression test to ensure nothing is breaking due to PRs
 */

const glob = require('glob');
const { basename, join } = require('path');
const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const puppeteer = require('puppeteer');
const portfinder = require('portfinder');

const TIMEOUT = 20 * 1000;

describe('basic regression tests', function() {
    const exclude = [
        // Excluded templates:
        'choropleth', // Downloading the data takes too long and fails test
        'poll-tracker', // This is really broken in a lot of ways

        // These don't have testable files
        'docs',
        'extras',
        'node_modules',
        '.tests',
    ];

    const dirs = glob.sync(`${__dirname}/../*/`)
        .map(dir => basename(dir))
        .filter(dir => !exclude.includes(dir));

    let server;
    let port;
    let browser;

    beforeAll(async () => {
        try {
            port = await portfinder.getPortPromise();
            server = http.createServer(connect().use(serveStatic(join(__dirname, '..'))));
            browser = await puppeteer.launch();
            return new Promise(resolve =>
                server.listen(port, resolve));
        } catch (e) {
            console.error(e);
            if (server.close) server.close();
        }
    });

    afterAll(async () => {
        await browser.close();
        return new Promise(resolve => server.close(resolve));
    });

    dirs.forEach(dir => {
        test(`${dir}`, async () => {
            console.log(`On: ${dir}`);
            const page = await browser.newPage();

            try {
                const assertNoError = err => expect(err.message).not.toBeDefined();

                page.on('pageerror', assertNoError);
                page.on('requestfailed', assertNoError);

                await page.goto(`http://localhost:${port}/${basename(dir)}`, {waitUntil: 'networkidle0'});
                return await page.close();
            } catch (e) {
                console.error(e);
                await page.close();
            }
        }, TIMEOUT);
    });
});
