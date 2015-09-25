/*global JSONEditor, IframeHelper */
(function () {
    var $ = window.$;

    // Step 1. Define default path to file with schema
    var settingsSchemaSrc = "settings.schema.json"; // default path to json schema of settings' fields

    // Step 2. If custom path was defined - is it
    if (settingsSchemaSrc in window) {
        settingsSchemaSrc = window.settingsSchemaSrc;    // use custom path if exists
    }

    // Step 3. Get data from json file. Call onPropertiesSchemaReady() when schema received
    $.getJSON(settingsSchemaSrc, function (propertiesSchema) {
        onPropertiesSchemaReady(propertiesSchema);
    });

    // Step 4. Render form (using cool JSONEditor), init some other tools and listen "click" on form's submit button
    var onPropertiesSchemaReady = function (propertiesSchema) {

        /**
         * JSON Schema -> HTML Editor
         * https://github.com/jdorn/json-editor/
         */
        var editor = new JSONEditor($('#form-setting')[0], {
            disable_collapse: true,
            disable_edit_json: true,
            disable_properties: true,
            no_additional_properties: true,
            schema: {
                type: 'object',
                title: 'Widget settings',
                properties: propertiesSchema
            },
            required: [],
            required_by_default: true,
            theme: 'bootstrap3'
        });

        // Init IframeHelper
        var inno = new IframeHelper();
        inno.showLoader();
        inno.onReady(function () {
            inno.getWidgetSettings(function (status, data) {
                if (status) {
                    editor.setValue(data);
                } else {
                    console.log('Error: unable to get Widget Settings');
                }
                inno.sendIsReady();
                inno.hideLoader();
            });
        });

        // Listen submit button click event
        $('#submit-setting').on('click', function () {
            var errors = editor.validate();
            if (errors.length) {
                errors = errors.map(function (error) {
                    var field = editor.getEditor(error.path),
                        title = field.schema.title;
                    return title + ': ' + error.message;
                });
                console.log(errors.join('\n'));
            } else {
                inno.showLoader('Saving...');
                inno.setWidgetSettings(editor.getValue(), function (status) {
                    inno.hideLoader();
                    if (status) {
                        console.log('Settings were saved');
                    }
                });
            }
        });
    };

})();
