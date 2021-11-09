module.exports = function snakeCase(context) {
    return {
        Identifier: function(node) {
            
            if (/[A-Z]/.test(context.getSource(node))) {
                        
                context.report(node, '`{{identifier}}` : Variable must be in snake case', {
                    identifier: node.name,
                });
            } else {
                return;
            }
        },
    };
};