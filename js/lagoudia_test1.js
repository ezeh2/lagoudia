

$(document).ready(function() {
    $('#form1').lagoudia('load', {
        'server_url': 'http://localhost:4040/api/employee',
        'server_data': {
            'employee_id': '987'
        },
        'field_definitions': {
            'field9': {
                'displaylabel': 'Field1',
                'fieldType': 'text'
            },
            'field8': {
                'displaylabel': 'Field2',
                'fieldType': 'textarea',
                'rows': '4',
                'cols': '40'
            },
            'field7': {
                'displaylabel': 'Field3',
                'fieldType': 'hidden'
            },
            'field6': {
                'displaylabel': 'Field4',
                'fieldType': 'yesnocheckboxes'
            },
            'field2': {
                'displaylabel': 'Field31',
                'fieldType': function (record) {

                    if ((record.field4 != null) && (record.field4 == "Yes")) {
                        return 'text';
                    } 
                    else {
                        return 'textarea';
                    }
                }
            }
            ,
            'field3': {
                'displaylabel': 'Field31',
                'fieldType': 'multiselect'
            }
            ,
            'field4': {
                'displaylabel': 'Field45',
                'fieldType': 'select'
            }
        }
    });

    $('#form1').dialog({
        width: '500px',
        buttons: [
            {
                text: 'Save',
                click: function() {

                    $('#form1').lagoudia('save', {
                        'server_url': 'http://localhost:4040/api/employee',
                        'server_data': {
                            'employee_id': '987'
                        }
                    });

                    $(this).dialog("close");
                }
            }
            ,{
                text: 'Cancel',
                click: function() {
                    $(this).dialog("close");
            }
            }
        ]
    });
});