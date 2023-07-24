import { debounce, DebouncedFunc } from 'lodash';

type ProcessQueryInnerCallback = (seq: number, query: string) => void;
export type SearchResultsProcessor<R> = (result: R, query: string) => void;
export type SetResultsCallback<R> = (result: R) => void;
export type SearchResultsProvider<R> = (options: {
    query: string;
    setResults: SetResultsCallback<R>;
    isQueryStillActual: () => boolean;
}) => void;

export type DebounceSearchOptions<R> = {
    debounceMs: number;
    resultsProvider: SearchResultsProvider<R>;
    resultsProcessor: SearchResultsProcessor<R>;
    emptyQueryResult: () => R;
    trimQuery?: boolean;
};

export interface IDebounceSearch {
    search(query: string): void;

    search(query: string, forceIfSame: boolean): void;
}

export class DebounceSearch<R> implements IDebounceSearch {
    private seq: number = 0;

    private lastQuery: string = '';

    private readonly debouncedQueryProcessor!: DebouncedFunc<ProcessQueryInnerCallback>;

    constructor(private options: DebounceSearchOptions<R>) {
        this.debouncedQueryProcessor = debounce<ProcessQueryInnerCallback>(
            (seq, query) => {
                if (seq === this.seq) {
                    this.lastQuery = query;
                    if (!query) {
                        this.options.resultsProcessor(
                            this.options.emptyQueryResult(),
                            query,
                        );
                    } else {
                        this.options.resultsProvider({
                            query,
                            setResults: (result) => {
                                if (seq === this.seq) {
                                    this.options.resultsProcessor(
                                        result,
                                        query,
                                    );
                                } else {
                                    // console.log('SKIP RESULT');
                                }
                            },
                            isQueryStillActual: () => seq === this.seq,
                        });
                    }
                } else {
                    // console.log('SKIP REQUEST');
                }
            },
            this.options.debounceMs || 300,
        );
    }

    public search(query: string, forceIfSame: boolean = false) {
        const queryProcessed = this.options.trimQuery ? query.trim() : query;
        if (queryProcessed !== this.lastQuery || forceIfSame) {
            this.seq += 1;
            // console.log('K', query);
            this.debouncedQueryProcessor(this.seq, queryProcessed);
            if (!queryProcessed) {
                this.debouncedQueryProcessor.flush();
            }
        }
    }
}

export function makeDebounceSearch<R = any>(
    options: DebounceSearchOptions<R>,
): IDebounceSearch {
    return new DebounceSearch<R>(options);
}
