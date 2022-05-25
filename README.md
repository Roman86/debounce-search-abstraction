# debounce-search-abstraction
A tool to easily make the search debounce properly

## Usage

```shell
npm i debounce-search-abstraction
```

```typescript
// import the class
import { DebounceSearch } from 'debounce-search-abstraction';

// optionally define a result type (any by default)
type SearchResult = {
    items: string[],
};

// make the instance (2 important callbacks)
const search = new DebounceSearch<SearchResult>({
    // input reaction debounce so API requests won't go out too often as you type
    debounceMs: 300,
    // this guy makes the api request(s) to obtain and set (with callback) the search result data
    async resultsProvider({ query, setResults }) {
        await sleep(500); // emulating some api request here
        // and set the results
        setResults({
            items: query.split(''), // all the query chars, just for example
        });
        // You may call this function as many times as you need,
        // in case you want to extend (replace) with some extra source results in series
        // Any set too late results will be ignored (if any input occur)
    },
    // and this guy applies the results (if they aren't outdated)
    resultsProcessor(result) {
        // note: it's called with the actual results only (late results won't get here)
        console.log('RESULT', result); // render some list here
    },
    // when the query is empty - you don't have to make any requests,
    // just provide the empty results (according to your results type)
    emptyQueryResult: () => ({
        items: [],
    }),
});

// Example
// We emulate the user typing "Hello Foobar" with some delays and then erasing the text
// [ inputDelay, char ]
const type: Array<[number, string]> = [
    [100, 'h'],
    [300, 'e'],
    [400, 'l'],
    [200, 'l'],
    [400, 'o'],
    [1000, ' '],
    [400, 'F'],
    [400, 'o'],
    [300, 'o'],
    [100, 'b'],
    [200, 'a'],
    [100, 'r'],
    [1000, ''], // erasing the text
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

// in this example resultsProcessor will be called 3 times (due to input and request delays),
// extra inputs invalidate late results.
// Results of the following 3 queries will be given to resultsProcessor:
// Hello
// Hello Foobar
// (empty)

// resultsProvider is also called effectively (respecting the debounceMs)
```
