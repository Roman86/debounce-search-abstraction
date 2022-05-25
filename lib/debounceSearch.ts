import { debounce } from 'lodash';

type ProcessQueryInnerCallback = (seq: number, query: string) => void;
export type SearchResultsProcessor<R> = (result: R) => void;
export type SearchResultsProvider<R> = (options: {
    query: string;
    setResults: SearchResultsProcessor<R>;
}) => void;

export type DebounceSearchOptions<R> = {
    debounceMs: number;
    resultsProvider: SearchResultsProvider<R>;
    resultsProcessor: SearchResultsProcessor<R>;
};

export interface IDebounceSearch {
    search(query: string): void;

    search(query: string, forceIfSame: boolean): void;
}

export class DebounceSearch<R> implements IDebounceSearch {
    private seq: number = 0;

    private lastQuery: string = '';

    private readonly debouncedQueryProcessor!: ProcessQueryInnerCallback;

    constructor(options: DebounceSearchOptions<R>) {
        this.debouncedQueryProcessor = debounce<ProcessQueryInnerCallback>(
            (seq, query) => {
                if (seq === this.seq) {
                    options.resultsProvider({
                        query,
                        setResults: (result) => {
                            if (seq === this.seq) {
                                options.resultsProcessor(result);
                            } else {
                                // console.log('SKIP RESULT');
                            }
                        },
                    });
                } else {
                    // console.log('SKIP REQUEST');
                }
            },
            options.debounceMs || 300,
        );
    }

    public search(query: string, forceIfSame: boolean = false) {
        if (query !== this.lastQuery || forceIfSame) {
            this.lastQuery = query;
            this.seq += 1;
            // console.log('K', query);
            this.debouncedQueryProcessor(this.seq, query);
        }
    }
}

export function makeDebounceSearch<R = any>(
    options: DebounceSearchOptions<R>,
): IDebounceSearch {
    return new DebounceSearch<R>(options);
}
