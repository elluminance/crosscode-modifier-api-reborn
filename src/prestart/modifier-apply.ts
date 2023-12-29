sc.CombatParams.inject({
    init(baseParams) {
        this.parent(baseParams);

        for (let i = 4; i < sc.COMBAT_STATUS.length; i++) {
            if (sc.COMBAT_STATUS[i]) this.statusStates[i] = new sc.COMBAT_STATUS[i];
        }
    },

    getDamage(attackInfo, damageFactorMod, combatant, shieldResult, hitIgnore) {
        let callbacks = [], modResult, elemFactor;
        
        let oldDmgFactor = attackInfo.damageFactor;
        let dmgFactor = attackInfo.damageFactor;
        if (!ig.perf.skipDmgModifiers) {
            for (let func of Object.values(ModifierAPI.PreDamageCalcFuncs)) {
                let result = func(attackInfo, dmgFactor, combatant.getCombatantRoot(), shieldResult, hitIgnore, this);
                attackInfo = result.attackInfo;
                dmgFactor = result.damageFactor;
                if(result.applyDamageCallback) {
                    callbacks.push(result.applyDamageCallback);
                }
            }

            if(attackInfo.element){
                elemFactor = this.getStat("elemFactor")[attackInfo.element - 1] * this.tmpElemFactor[attackInfo.element - 1]
            };
        }
        
        attackInfo.damageFactor = dmgFactor;
        let damageResult = this.parent(attackInfo, damageFactorMod,  combatant, shieldResult, hitIgnore);
        attackInfo.damageFactor = oldDmgFactor;

        for(let func of Object.values(ModifierAPI.PostDamageCalcFuncs)) {
            let result = func(damageResult, attackInfo, combatant, shieldResult, hitIgnore, this);

            if(result.applyDamageCallback) {
                callbacks.push(result.applyDamageCallback);
            }
        }

        damageResult.damage = Math.round(damageResult.damage)
        damageResult.callbacks = callbacks;

        return damageResult;
    },

    applyDamage(damageResult, attackInfo, combatant) {
        this.parent(damageResult, attackInfo, combatant);
        for(let callback of damageResult.callbacks) callback();
    }
})