// @ts-ignore
import StreamrClient from 'streamr-client';
import defaults from 'lodash/defaults';

import { Observable, merge } from 'rxjs';
import {
    DataQueryRequest,
    DataQueryResponse,
    DataSourceApi,
    CircularDataFrame,
    DataSourceInstanceSettings,
    FieldType,
    LoadingState,
} from '@grafana/data';

import { MyQuery, MyDataSourceOptions, defaultQuery, StreamMetadata } from './types';

export class DataSource extends DataSourceApi<MyQuery, MyDataSourceOptions> {
    sessionToken: string;
    streamId: string;
    noAddedFields: boolean;

    constructor(instanceSettings: DataSourceInstanceSettings<MyDataSourceOptions>) {
        super(instanceSettings);

        this.sessionToken = instanceSettings.jsonData.sessionToken;
        this.streamId = instanceSettings.jsonData.streamId;
        this.noAddedFields = true;
    }

    query(options: DataQueryRequest<MyQuery>): Observable<DataQueryResponse> {
        const observables = options.targets.map((target) => {
            const query = defaults(target, defaultQuery);
            const refId = query.refId;
            const stream = this.streamId;
            const sessionToken = this.sessionToken;
            const streamrClient = new StreamrClient({ auth: { sessionToken } });

            return new Observable<DataQueryResponse>((subscriber) => {
                const frame = new CircularDataFrame({
                    append: 'tail',
                    capacity: 1000,
                });

                frame.refId = query.refId;
                frame.addField({ name: 'time', type: FieldType.time });

                streamrClient.subscribe({ stream }, (payload: JSON, metadata: Object) => {
                    if (!payload || !metadata) {
                        return;
                    }

                    const { messageId } = metadata as StreamMetadata;
                    const time = messageId.timestamp;

                    if (this.noAddedFields) {
                        for (const [key, value] of Object.entries(payload)) {
                            frame.addField({ name: key, type: this.getValueType(value) });
                        }

                        this.noAddedFields = false;
                    }

                    frame.add({ time, ...payload });

                    subscriber.next({
                        data: [frame],
                        key: refId,
                        state: LoadingState.Streaming,
                    });
                });
            });
        });

        return merge(...observables);
    }

    /*
        Get value type because Streamr field types
        aren't compatible to Grafana field types
    */
    getValueType(value: any): FieldType {
        switch (typeof value as string) {
            case 'string':
                return FieldType.string;
            case 'boolean':
                return FieldType.boolean;
            case 'number':
                if (new Date(value).getFullYear() > 1970) {
                    return FieldType.time;
                }
                return FieldType.number;
            default:
                return FieldType.other;
        }
    }

    testDatasource(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            if (!this.sessionToken) {
                return reject({
                    status: 'error',
                    message: 'Streamr Private Key is required',
                });
            }

            if (!this.streamId) {
                return reject({
                    status: 'error',
                    message: 'Streamr ID is required',
                });
            }

            try {
                const streamrClient = new StreamrClient({
                    auth: {
                        sessionToken: this.sessionToken,
                    },
                });

                const stream = await streamrClient.getStream(this.streamId);

                if (stream.id) {
                    return resolve({
                        status: 'success',
                        message: `Successfully fetched stream "${stream.name}"`,
                    });
                }

                return reject({
                    status: 'error',
                    message: 'Failed to fetch the stream',
                });
            } catch (error) {
                return reject({
                    status: 'error',
                    message: error.message,
                });
            }
        });
    }
}
