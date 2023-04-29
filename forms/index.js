const forms = require("forms");
// create some shortcuts
const fields = forms.fields;
const validators = forms.validators;
const widgets = forms.widgets;

var bootstrapField = function (name, object) {
    if (!Array.isArray(object.widget.classes)) { object.widget.classes = []; }

    if (object.widget.classes.indexOf('form-control') === -1) {
        object.widget.classes.push('form-control');
    }

    var validationclass = object.value && !object.error ? 'is-valid' : '';
    validationclass = object.error ? 'is-invalid' : validationclass;
    if (validationclass) {
        object.widget.classes.push(validationclass);
    }

    var label = object.labelHTML(name);
    var error = object.error ? '<div class="invalid-feedback">' + object.error + '</div>' : '';

    var widget = object.widget.toHTML(name, object);
    return '<div class="form-group">' + label + widget + error + '</div>';
};


const createProductForm = (categories, brands, applications, tags) => {
    return forms.create({
        'name': fields.string({
            required: true,
            errorAfterField: true
        }),
        cost: fields.number({
            label: 'Cost (SGD):',
            required: true,
            errorAfterField: true,
            validators: [validators.integer(), validators.min(0)]
        }),
        'description': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        }),
        'warranty': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        }),
        'indoor_unit': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        }),
        'outdoor_unit': fields.string({
            required: true,
            errorAfterField: true,
            widget: forms.widgets.textarea()
        }),
        'category_id': fields.string({
            label:'Category',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: categories
        }),
        'brand_id': fields.string({
            label:'Brand',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: brands
        }),
        'application_id': fields.string({
            label:'Application',
            required: true,
            errorAfterField: true,
            widget: widgets.select(),
            choices: applications
        }),
        'tags': fields.string({
            required: true,
            errorAfterField: true,
            cssClasses: {
                label: ['form-label']
            },
            widget: widgets.multipleSelect(),
            choices:tags
        }),
        'image_url':fields.string({
            widget: widgets.hidden()
        })
    })
};

const createRegistrationForm = () => {
    return forms.create({
        'username': fields.string({
            required: true,
            errorAfterField: true
        }),
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        }),
        'confirm_password': fields.password({
            required: true,
            errorAfterField: true,
            validators: [validators.matchField('password')]
        })
    })
}

const createLoginForm = () => {
    return forms.create({
        'email': fields.string({
            required: true,
            errorAfterField: true
        }),
        'password': fields.password({
            required: true,
            errorAfterField: true
        }),
    })
}


module.exports = {createProductForm, bootstrapField, createRegistrationForm, createLoginForm}