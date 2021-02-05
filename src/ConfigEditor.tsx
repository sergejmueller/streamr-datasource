// @ts-ignore
import StreamrClient from 'streamr-client';
import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions, MySecureJsonData } from './types';

const { SecretFormField, FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
    getStreamrSessionToken = async (privateKey: string): Promise<string> => {
        if (privateKey.length !== 66) {
            return '';
        }

        const streamrClient = new StreamrClient({
            auth: {
                privateKey: privateKey,
            },
        });

        return await streamrClient.session.getSessionToken();
    };

    onPrivateKeyChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const { value } = event.target;

        if (!value) {
            return;
        }

        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            sessionToken: await this.getStreamrSessionToken(event.target.value),
        };

        onOptionsChange({
            ...options,
            jsonData,
            secureJsonData: {
                privateKey: value,
            },
        });
    };

    onResetPrivateKey = () => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            sessionToken: '',
        };

        onOptionsChange({
            ...options,
            jsonData,
            secureJsonFields: {
                ...options.secureJsonFields,
                privateKey: false,
            },
            secureJsonData: {
                ...options.secureJsonData,
                privateKey: '',
            },
        });
    };

    onStreamIdChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            streamId: event.target.value,
        };
        onOptionsChange({ ...options, jsonData });
    };

    render() {
        const { options } = this.props;
        const { jsonData, secureJsonFields } = options;
        const secureJsonData = (options.secureJsonData || {}) as MySecureJsonData;

        return (
            <div className="gf-form-group">
                <div className="gf-form">
                    <SecretFormField
                        label="Private Key"
                        labelWidth={6}
                        inputWidth={20}
                        onReset={this.onResetPrivateKey}
                        onChange={this.onPrivateKeyChange}
                        isConfigured={(secureJsonFields && secureJsonFields.privateKey) as boolean}
                        value={secureJsonData.privateKey || ''}
                        name="privateKey"
                        placeholder="Streamr Private Key"
                    />
                </div>
                <div className="gf-form">
                    <FormField
                        label="Stream ID"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onStreamIdChange}
                        value={jsonData.streamId || ''}
                        placeholder="Streamr Stream ID"
                    />
                </div>
            </div>
        );
    }
}
