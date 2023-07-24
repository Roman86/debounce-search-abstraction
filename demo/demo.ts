import { makeDebounceSearch } from '../lib/debounceSearch';
import { sleep } from './sleep';

type Result = string;

function setQuery(query: string): void {
    const reqEl = document.getElementById('request');
    if (reqEl) {
        reqEl.innerText = query;
    }
}

function setResults(res: Result): void {
    const outputElement = document.getElementById('result');
    if (outputElement != null) {
        outputElement.innerText = res;
    }
}

async function backendUppercase(query: string): Promise<Result> {
    await sleep(500);
    return query.toUpperCase();
}
async function backendReverse(query: string): Promise<Result> {
    await sleep(500);
    return query.split('').reverse().join('');
}

const search = makeDebounceSearch<Result>({
    debounceMs: 300,
    emptyQueryResult: () => '',
    resultsProvider: async ({ query, setResults, isQueryStillActual }) => {
        setQuery(query);
        const upperCase = await backendUppercase(query);
        setResults('(1) ' + upperCase);
        if (isQueryStillActual()) {
            setResults('(1+2) ' + (await backendReverse(upperCase)));
        }
    },
    resultsProcessor: (result) => {
        setQuery('');
        setResults(result);
    },
    trimQuery: true,
});

const inp = document.getElementById('inp') as HTMLInputElement | null;
if (inp) {
    inp.addEventListener('input', (e) => {
        const inp = e.target as HTMLInputElement;
        if (inp != null) {
            setQuery('');
            search.search(inp.value);
        }
    });
}
