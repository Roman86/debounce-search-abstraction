import { DebounceSearch } from './debounceSearch';
import { booleanFilter } from './booleanFilter';
import { sleep } from '../demo/sleep';
import { nullFilter } from './nullFilter';

// optionally define a result type (any by default)
type SearchResult = {
    transformedQuery: string; // in this guide we will be transforming the input query
    // usually you would want some array of resulting items here
};

describe('debounceSearch', () => {
    it('delayed input', async () => {
        const requestCallback: jest.Mock<(query: string) => void> = jest.fn();
        const resultsProcessorCallback: jest.Mock<
            (transformed: string) => void
        > = jest.fn();

        // create your instance (2 important callbacks)
        const search = new DebounceSearch<SearchResult>({
            // input reaction debounce so API requests won't go out too often as you type
            debounceMs: 300,
            // this guy makes the api request(s) to obtain and set (with callback) the search result data
            async resultsProvider({ query, setResults, isQueryStillActual }) {
                requestCallback(query);
                await sleep(200); // emulating some api request here
                const upperCased = query.toUpperCase(); // let's just do it uppercase
                // and set the results
                setResults({
                    transformedQuery: upperCased,
                });
                // You may call this function as many times as you need,
                // in case you want to extend (replace) with some extra source results in series
                // Notice, that any late results (if user updates the query) will be skipped automatically
                // So if you need any subsequent request(s) - make sure to check if our query is still actual
                if (isQueryStillActual()) {
                    await sleep(200); // another backend request
                    // btw, you don't need to check query actuality before calling setResult,
                    // the check is already inside because it forced to skip outdated results.

                    // This time, let's just add a query length
                    // User would see the uppercase query first (setResults call above),
                    // and then, after 200 ms the length information would be added.
                    // In most real cases you would call it just once
                    setResults({
                        // let's add a query length
                        transformedQuery: `${upperCased} (${upperCased.length})`,
                    });
                }
            },
            // and this guy applies the results (if they aren't outdated)
            resultsProcessor(result) {
                resultsProcessorCallback(result.transformedQuery);
            },
            // when the query is empty - you don't have to make any requests,
            // just provide the empty results (according to your results type)
            emptyQueryResult: () => ({
                transformedQuery: '',
            }),
            // we don't want trailing and leading spaces to make new requests
            trimQuery: true,
        });

        // Example scenario (from the package test)
        // We emulate user typing "Hello There!" with some delays and then erasing the text back

        // expected scenario:
        // array items description:
        // 1. input char
        // 2. waiting time before typing the next char
        // 3. outgoing query or null (if skipped due to debounce)
        // 4. search results or null (if skipped due to updated query)
        // we have a debounce set to 300 and API delays are 200 for uppercase result + 200 for length result
        const scenario: Array<
            [string, number, null | string, string[] | null]
        > = [
            ['H', 300, 'H', null], // no response - it takes 300+200=500
            ['e', 400, 'He', null],
            ['l', 200, null, null],
            ['l', 500, 'Hell', ['HELL']], // 500 is enough to get the first response
            ['o', 700, 'Hello', ['HELLO', 'HELLO (5)']], // 700 is enough to get both responses
            [' ', 600, null, null], // space doesn't affect the query, because we used the trimQuery option
            ['T', 600, 'Hello T', ['HELLO T']],
            ['h', 300, 'Hello Th', null],
            ['e', 100, null, null],
            ['r', 200, null, null],
            ['e', 400, 'Hello There', null],
            ['!', 800, 'Hello There!', ['HELLO THERE!', 'HELLO THERE! (12)']],
            ['', 700, '', ['']], // clearing the query - we will get the empty result immediately
        ];

        let growingQuery = '';
        for (const [char, nextDelay] of scenario) {
            if (char) {
                growingQuery += char;
            } else {
                growingQuery = '';
            }
            search.search(growingQuery);
            await sleep(nextDelay + 5); // not sure why, but debounce 300 + 200 ms request takes 505 ms
        }

        // expected requests and results
        const events = {
            requests: scenario.map((s) => s[2]).filter(booleanFilter),
            results: scenario
                .map((s) => s[3])
                .flat()
                .filter(nullFilter),
        };

        // expected requests check
        events.requests.forEach((r, i) => {
            expect(requestCallback).toHaveBeenNthCalledWith(i + 1, r);
        });
        expect(requestCallback).toHaveBeenCalledTimes(events.requests.length);

        // expected results check
        events.results.forEach((r, i) => {
            expect(resultsProcessorCallback).toHaveBeenNthCalledWith(i + 1, r);
        });
        expect(resultsProcessorCallback).toHaveBeenCalledTimes(
            events.results.length,
        );
    });
});
