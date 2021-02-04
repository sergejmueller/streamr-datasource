import React, { ChangeEvent, PureComponent } from 'react';
import { LegacyForms } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { MyDataSourceOptions } from './types';

const { FormField } = LegacyForms;

interface Props extends DataSourcePluginOptionsEditorProps<MyDataSourceOptions> {}

interface State {}

export class ConfigEditor extends PureComponent<Props, State> {
    onValueChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { onOptionsChange, options } = this.props;
        const jsonData = {
            ...options.jsonData,
            [event.target.name]: event.target.value,
        };
        onOptionsChange({ ...options, jsonData });
    };

    render() {
        const { options } = this.props;
        const { jsonData } = options;

        return (
            <div className="gf-form-group">
                <div className="gf-form">
                    <FormField
                        label="Private Key"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onValueChange}
                        value={jsonData.privateKey || ''}
                        name="privateKey"
                        placeholder="Streamr Private Key"
                    />
                </div>
                <div className="gf-form">
                    <FormField
                        label="Stream ID"
                        labelWidth={6}
                        inputWidth={20}
                        onChange={this.onValueChange}
                        value={jsonData.streamId || ''}
                        name="streamId"
                        placeholder="Streamr Stream ID"
                    />
                </div>
            </div>
        );
    }
}
