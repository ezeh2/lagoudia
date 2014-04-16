


// Immediately Invoked Function Expression (IIFE) (2)
// So how then do we define more functions without cluttering the namespace and 
// without exposing the implementation? This is a job for closures.
// closure vs. Immediately Invoked Function Expression: http://benalman.com/news/2010/11/immediately-invoked-function-expression/#iife
(function($) {

    var l_default_options = {
        'fields_insert_selector': '.lagoudia_div_form_fields'
    };

    var l_handle_field_by_field_type = {
        'text': function(htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendLabel(name, fieldDefinition.displaylabel);
            htmlStringBuilder.appendInputElement(name, 'text', recordFieldValue);
        },
        'textarea': function (htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendLabel(name, fieldDefinition.displaylabel);
            htmlStringBuilder.appendTextareaElement(name, recordFieldValue, fieldDefinition.rows, fieldDefinition.cols);
        },
        'hidden': function (htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendInputElement(name, 'hidden', recordFieldValue);
        },
        'yesnocheckboxes': function (htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendLabel(name, fieldDefinition.displaylabel);
            htmlStringBuilder.appendBoxElements(name, 'radio', ['Yes', 'No'], ['Yes', 'No'], recordFieldValue);
        },
        'multiselect': function (htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendLabel(name, fieldDefinition.displaylabel);
            htmlStringBuilder.appendBoxElements(name, 'checkbox', ['Basel', 'Luzern', 'Zürich', 'Genf', 'Chur'], ['1', '2', '3', '4', '5'], recordFieldValue);
        },
        'select': function (htmlStringBuilder, name, fieldDefinition, recordFieldValue) {
            htmlStringBuilder.appendLabel(name, fieldDefinition.displaylabel);
            htmlStringBuilder.appendSelectElements(name, ['Basel', 'Luzern', 'Zürich', 'Genf', 'Chur'], ['1', '2', '3', '4', '5'], recordFieldValue);
        }
    };


    $.fn.lagoudia = function(action, options) {

        var l_combined_options = $.extend(l_default_options, options);

        assertRequiredLagoudiaOptions(l_combined_options);

        if (action == 'load') {
            lagoudiaLoad(this, l_combined_options);
        }
        else if (action == 'save') {
            lagoudiaSave(this, l_combined_options);
        }
        else {
            throw 'lagoudia: unknown action: ' + action;
        }
    };

    function assertRequiredLagoudiaOptions(combinedOptions) {
        
        if (combinedOptions.server_url == null) {
            throw 'lagoudia: required option "server_url" is not set';
        }

        if (combinedOptions.field_definitions == null) {
            throw 'lagoudia: required option "field_definitions" is not set';
        }
    }

    function assertProperty(data, propname, exceptionText) {

        if (!data.hasOwnProperty(propname)) {
            throw exceptionText;
        }
    }

    function lagoudiaLoad(t, options) {

        // get data from server
        $.get(options.server_url, options.server_data, function (record) {

            var l_html_string_builder = new HtmlStringBuilder();

            // iterate over all own properties of field definitions
            for (var l_field_name in options.field_definitions) {
                if (options.field_definitions.hasOwnProperty(l_field_name)) {

                    assertProperty(record, l_field_name, 'lagoudia: data coming from ' + options.server_url + ' has no property ' + l_field_name);

                    // current field defintion
                    var l_field_definition = options.field_definitions[l_field_name];
                    // current field value
                    var l_record_field_value = record[l_field_name];

                    handleField(l_html_string_builder, l_field_name, l_field_definition, record, l_record_field_value);
                }
            }

            t.append(l_html_string_builder.toString());
        });
    }

    function handleField(htmlStringBuilder, name, fieldDefinition, record, recordFieldValue) {

        // get fieldType, this can be a text or a function
        var l_field_type_text_or_function = fieldDefinition.fieldType;
        var l_field_type = null;

        if (l_field_type_text_or_function instanceof Function) {
            // call function to get field type
            // using a function it is possible that the type of one field depends on current record-data
            l_field_type = l_field_type_text_or_function(record);
        } else {
            // get field-type directly
            l_field_type = l_field_type_text_or_function;
        }

        assertProperty(l_handle_field_by_field_type, l_field_type, 'lagoudia: for field '+name+' there is no template with this name: ' + l_field_type);
        var l_handle_field_function = l_handle_field_by_field_type[l_field_type];

        l_handle_field_function(htmlStringBuilder, name, fieldDefinition, recordFieldValue);
    }

    function lagoudiaSave(t, options) {

        $.ajax(options.server_url + '?employee_id=20', {
            'type': 'PUT',
            'data': options.server_data,
            sucess: function(data, textStatus, jqXHR) {

            }

        });
    }

    // Initializes a new instance of the StringBuilder class
    // and appends the given value if supplied
    // ReSharper disable once InconsistentNaming
    function HtmlStringBuilder(value) {
        this.strings = new Array("");
        this.append(value);
    }

    // Appends the given value to the end of this instance.
    HtmlStringBuilder.prototype.append = function (value) {
        if (value) {
            this.strings.push(value);
        }
        return this;
    }

    HtmlStringBuilder.prototype.appendWithQuotes = function (value) {
        if (value) {
            this.append('\'').append(value).append('\'');
        }
        return this;
    }

    HtmlStringBuilder.prototype.htmlEncode = function (value) {

        // http://stackoverflow.com/questions/1219860/html-encoding-in-javascript-jquery
        return String(value)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
    }

    HtmlStringBuilder.prototype.htmlDecode = function (value) {
        return $('<div/>').html(value).text();
    }

    HtmlStringBuilder.prototype.appendInputElement = function (name, type, value) {

        this.appendElement('input',
        {
            'type': type,
            'name': name,
            'value': this.htmlEncode(value),
            'class':'form-control'
        },
        '');

        return this;
    }

    HtmlStringBuilder.prototype.appendTextareaElement = function (name, value, rows, cols) {

        this.appendElement('textarea',
        {
            'cols': cols,
            'rows': rows,
            'name': name,
            'value': this.htmlEncode(value),
            'class': 'form-control'
        },
        '');

        return this;
    }

    HtmlStringBuilder.prototype.appendBoxElements = function (name, type, texts, values, selectedValue) {

        this.appendBeginElement('div', { 'class': 'form-control' });

        for (var l_i = 0; l_i < values.length; l_i++) {

            var l_html_attributes = {
                'type': type,
                'name': name,
                'value': values[l_i]
            };

            // also check if selectedValue is an array
            if ((selectedValue == values[l_i]) || (selectedValue.indexOf(values[l_i])!=-1)) {
                l_html_attributes.checked = 'checked';
            }

            this.appendElement('input',
            l_html_attributes,
            '');
            this.appendSpan(texts[l_i]);
        }

        this.appendEndElement('div');

        return this;
    }


    HtmlStringBuilder.prototype.appendSelectElements = function (name, texts, values, value) {

        this.appendBeginElement('select', { 'class': 'form-control', 'name': name });

        for (var l_i = 0; l_i < values.length; l_i++) {

            var l_html_attributes = {
                'value': values[l_i]
            };

            if (value == values[l_i]) {
                l_html_attributes.selected = 'selected';
            }

            this.appendElement('option',
            l_html_attributes,
            texts[l_i]);
        }

        this.appendEndElement('select');

        return this;
    }

    HtmlStringBuilder.prototype.appendLabel = function (name, displaylabel) {

        this.appendElement('label',
        {
        'for': name
        },
        displaylabel);

        return this;
    }

    HtmlStringBuilder.prototype.appendSpan = function (text) {

        this.appendElement('span',
        {
        },
        text);

        return this;
    }


    HtmlStringBuilder.prototype.appendElement = function (htmlElementName, htmlAttributes, value) {
        this.append('<').append(htmlElementName);

        for (var l_prop in htmlAttributes) {
            this.append(' ');
            this.append(l_prop).append('=').appendWithQuotes(htmlAttributes[l_prop]);
        }
        this.append(' ');

        this.append('>');
        this.append(this.htmlEncode(value));
        this.append('</').append(htmlElementName).append('>');
        return this;
    }

    HtmlStringBuilder.prototype.appendBeginElement = function (htmlElementName, htmlAttributes) {
        this.append('<').append(htmlElementName);
        
        for (var l_prop in htmlAttributes) {
            this.append(' ');
            this.append(l_prop).append('=').appendWithQuotes(htmlAttributes[l_prop]);
        }
        this.append(' ');

        this.append('>');
        return this;
    }

    HtmlStringBuilder.prototype.appendEndElement = function (htmlElementName) {

        this.append('</').append(htmlElementName).append('>');
        return this;
    }


    // Clears the string buffer
    HtmlStringBuilder.prototype.clear = function () {
        this.strings.length = 1;
    }

    // Converts this instance to a String.
    HtmlStringBuilder.prototype.toString = function () {
        return this.strings.join("");
    }

}(jQuery));


