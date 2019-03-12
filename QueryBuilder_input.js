var _QueryBuilder = undefined
if(typeof(queryBuilder) == "undefined"){
    _QueryBuilder = $.fn.queryBuilder.constructor
}else{
    _QueryBuilder = _QueryBuilder
}

_QueryBuilder.prototype.getFilterById = function(id, doThrow) {
    if (id == '-1') {
        return null;
    }

    for (var i = 0, l = this.filters.length; i < l; i++) {
        if (this.filters[i].id == id) {
            return this.filters[i];
        }
    }

    //新增默认过滤器支持
    var _ret = undefined
    if(this.settings.default_filter != undefined){
         _ret = JSON.parse(JSON.stringify(this.settings.default_filter))
    }else{
        _ret = {
            type:'string',
            input:'input'
        }
    }
        if(id instanceof Object || id == null){
            id = ""
        }
        _ret.id = id
        _ret.name=id
        _ret.field=id
        if(this.settings.default_validation != undefined){
        _ret.validation = {callback:this.settings.default_validation}
        }
        return _ret
    
    _QueryBuilder.utils.error(doThrow !== false, 'UndefinedFilter', 'Undefined filter "{0}"', id);

    return null;
};



//模板从select改为INPUT
_QueryBuilder.templates.filterSelect = '\
    {{ var optgroup = null; }} \
    <input class="form-control" name="{{= it.rule.id }}_filter"> \
    </input>';

_QueryBuilder.prototype.createRuleInput = function(rule) {
        var $valueContainer = rule.$el.find(_QueryBuilder.selectors.value_container);
        var prev_values = [];
        //补丁：防止更换字段时后面的数据被删除掉
        try{
        prev_values = $valueContainer.map(function(index,ele){return ele.children[0].value});
        }catch(err){
    
        }
        
        $valueContainer = $valueContainer.empty()
    
        rule.__.value = undefined;
    
        if (!rule.filter || !rule.operator || rule.operator.nb_inputs === 0) {
            return;
        }
    
        var self = this;
        var $inputs = $();
        var filter = rule.filter;
    
        for (var i = 0; i < rule.operator.nb_inputs; i++) {
            var $ruleInput = $(this.getRuleInput(rule, i));
            if(prev_values[i] != undefined){
                 $ruleInput.val( prev_values[i]);
            }
            if (i > 0) $valueContainer.append(this.settings.inputs_separator);
            $valueContainer.append($ruleInput);
            $inputs = $inputs.add($ruleInput);
        }
    
        $valueContainer.css('display', '');
    
        $inputs.on('change ' + (filter.input_event || ''), function() {
            if (!rule._updating_input) {
                rule._updating_value = true;
                rule.value = self.getRuleInputValue(rule);
                rule._updating_value = false;
            }
        });
    
        if (filter.plugin) {
            $inputs[filter.plugin](filter.plugin_config || {});
        }
    
        /**
         * After creating the input for a rule and initializing optional plugin
         * @event afterCreateRuleInput
         * @memberof _QueryBuilder
         * @param {Rule} rule
         */
        this.trigger('afterCreateRuleInput', rule);
    
        if (filter.default_value !== undefined) {
            rule.value = filter.default_value;
        }
        else {
            rule._updating_value = true;
            rule.value = self.getRuleInputValue(rule);
            rule._updating_value = false;
        }
    
        this.applyRuleFlags(rule);
    };