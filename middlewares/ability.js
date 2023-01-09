const { AbilityBuilder, PureAbility } = require('@casl/ability');

const Actions = {
    Manage: 'manage',
    Create: 'create',

    Read: 'read',
    ReadAll: 'readAll',
    ReadPublicOnly: 'readAllPublish',

    Update: 'update',
    Delete: 'delete',
};

const defineAbilityFor = (user) => {
    const { can, cannot, build } = new AbilityBuilder(PureAbility);

    if (user.role === 'ADMIN' || user.role === 'DIRECTOR') {
        can(Actions.Manage, 'all');
    } else {
    }

    return build();
};

module.exports = { Actions, defineAbilityFor };
