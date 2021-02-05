import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
    queryText?: string;
    constant: number;
}

export const defaultQuery: Partial<MyQuery> = {
    constant: 6.5,
};

export interface MyDataSourceOptions extends DataSourceJsonData {
    streamId: string;
    sessionToken: string;
}

export interface MySecureJsonData {
    privateKey: string;
}

export interface StreamMetadata {
    messageId: {
        msgChainId?: string;
        publisherId?: string;
        sequenceNumber?: number;
        streamId: string;
        streamPartition?: number;
        timestamp: number;
    };
}
