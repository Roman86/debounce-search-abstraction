# debounce-search-abstraction
A tool to easily make the search debounce properly

ℹ️ it doesn't interact with DOM. It's abstract. You feed it with a search query, and it invokes your data callbacks.
It encapsulates debounce for your queries and skips the late results (concurrent requests).

## Usage

```shell
npm i debounce-search-abstraction
```

```typescript
// import the class
import { DebounceSearch } from 'debounce-search-abstraction';

// optionally define a result type (any by default)
type SearchResult = {
    transformedQuery: string; // in this guide we will be transforming the input query
    // usually you would want some array of resulting items here
};

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
});

// Example scenario (from the package test)
// We emulate user typing "Hello There!" with some delays and then erasing the text back

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
    [' ', 250, null, null], // no request, quicker than debounce
    ['T', 600, 'Hello T', ['HELLO T']],
    ['h', 300, 'Hello Th', null],
    ['e', 100, null, null],
    ['r', 200, null, null],
    ['e', 400, 'Hello There', null],
    ['!', 800, 'Hello There!', ['HELLO THERE!', 'HELLO THERE! (12)']],
    ['', 800, '', ['']],
];
```
