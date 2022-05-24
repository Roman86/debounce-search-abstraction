import { DebounceSearch } from './debounceSearch';

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(() => resolve(null), ms);
    });
}

describe('debounceSearch', () => {
    it('delayed input', async () => {
        // timers are divided by 10 just to speed up a test. Can't use fake times due to lodash.debounce being used:
        // https://github.com/lodash/lodash/issues/2893

        const delays = {
            keys: 25,
            api: 40,
            enough: 70, // must include both
        }

        const resultsProcessorCallback = jest.fn();

        // make the instance (2 important callbacks)
        const search = new DebounceSearch<string>({
            // input reaction debounce so API requests won't go out too often as you type
            debounceMs: delays.keys,
            // this guy makes the api request(s) to obtain and set (with callback) the search result data
            async resultsProvider({ query, setResults }) {
                await sleep(delays.api); // emulating some api request here
                // and set the results
                setResults(query);
                // You may call this function as many times as you need,
                // in case you want to extend (replace) with some extra source results in series
                // Any set too late results will be ignored (if any input occur)
            },
            // and this guy applies the results (if they aren't outdated)
            resultsProcessor(result) {
                resultsProcessorCallback(result);
            },
        });

        // Example
        // We emulate the user typing "Hello Kitty" with some delays and then erasing the text
        // [ inputDelay, char ]
        const type: Array<[number, string]> = [
            [delays.keys+0, 'H'],
            [delays.keys-1, 'e'],
            [delays.keys-1, 'l'],
            [delays.keys+1, 'l'],
            [delays.keys-1, 'o'],
            [delays.enough, ' '],
            [delays.keys+1, 'K'],
            [delays.keys-1, 'i'],
            [delays.keys+1, 't'],
            [delays.keys-1, 't'],
            [delays.keys-1, 'y'],
            [delays.enough, ''], // erasing the text
        ];
        let text = '';

        for (const [delay, char] of type) {
            await sleep(delay);
            if (char) {
                text += char;
            } else {
                text = '';
            }
            search.search(text);
        }

        await sleep(100); // let all callbacks a time to invoke

        expect(resultsProcessorCallback).toHaveBeenNthCalledWith(1, 'Hello');
        expect(resultsProcessorCallback).toHaveBeenNthCalledWith(2, 'Hello Kitty');
        expect(resultsProcessorCallback).toHaveBeenNthCalledWith(3, '');
        expect(resultsProcessorCallback).toHaveBeenCalledTimes(3);
    });
});
