export interface CompanyDetails {
    id: number;
    denomination: string;
    secteurActivite: string;
    ville: string;
    region: string;
    // Ajoutez d'autres propriétés selon vos besoins
}

export interface Page<T> {
    content: T[];
    pageable: {
        sort: {
            sorted: boolean;
            unsorted: boolean;
            empty: boolean;
        };
        offset: number;
        pageSize: number;
        pageNumber: number;
        paged: boolean;
        unpaged: boolean;
    };
    totalPages: number;
    totalElements: number;
    last: boolean;
    size: number;
    number: number;
    sort: {
        sorted: boolean;
        unsorted: boolean;
        empty: boolean;
    };
    numberOfElements: number;
    first: boolean;
    empty: boolean;
}