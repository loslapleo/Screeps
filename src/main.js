var roleBuilder = require('role.builder');
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleTransporter = require('role.transporter');

const ROLES = ['harvester', 'builder', 'upgrader', 'transporter'];
const MAX_HARVESTERS = 4;
const HARVESTER_BODY = [WORK, WORK, WORK, WORK, WORK, WORK,
                        CARRY, CARRY,
                        MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];
const MAX_BUILDERS = 1;
const BUILDER_BODY = [WORK, WORK, WORK, WORK, WORK,
                      CARRY, CARRY,
                      MOVE, MOVE, MOVE, MOVE];
const MAX_UPGRADERS = 3;
const UPGRADER_BODY = [WORK, WORK, WORK, WORK, WORK,
                       CARRY, CARRY,
                       MOVE, MOVE, MOVE, MOVE];
const MAX_TRANSPORTERS = 2;
const TRANSPORTER_BODY = [WORK, WORK, WORK, WORK, WORK, WORK,
                          CARRY, CARRY,
                          MOVE, MOVE, MOVE, MOVE, MOVE, MOVE];

module.exports.loop = function() {
    console.log('------------------------------------------');

    // Clears the memory of creeps to reduce computation costs.
    for (var name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

    // Spawns creeps if under specific amount.
    ROLES.forEach(function (role) {
        var currentCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        console.log(role + 's: ' + currentCreeps.length);
    });
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    if (harvesters.length < MAX_HARVESTERS) {
        makeCreeps('harvester', MAX_HARVESTERS, HARVESTER_BODY);
    } else {
        makeCreeps('builder', MAX_BUILDERS, BUILDER_BODY);
        makeCreeps('upgrader', MAX_UPGRADERS, UPGRADER_BODY);
        makeCreeps('transporter', MAX_TRANSPORTERS, TRANSPORTER_BODY);
    }

    if (Game.spawns['spawn_1'].spawning) {
        var spawningCreep = Game.creeps[Game.spawns['spawn_1'].spawning.name];
        Game.spawns['spawn_1'].room.visual.text(
            '🛠️' + spawningCreep.memory.role,
            Game.spawns['spawn_1'].pos.x + 1,
            Game.spawns['spawn_1'].pos.y,
            {align: 'left', opacity: 0.8});
    }

    // Run the actual roles.
    for (var name in Game.creeps) {
        var creep = Game.creeps[name];
        if (creep.memory.role == 'builder') {
            roleBuilder.run(creep);
        }
        if (creep.memory.role == 'harvester') {
            roleHarvester.run(creep);
        }
        if (creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep);
        }
        if (creep.memory.role == 'transporter') {
            roleTransporter.run(creep);
        }
    }

    // Tower functionality.
    var towers = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_TOWER);
        }
    });
    for (var i = 0; i < towers.length; i++) {
        if (towers[i]) {
            var closestHostile = towers[i].pos.findClosestByRange(FIND_HOSTILE_CREEPS);
            if (closestHostile) {
                towers[i].attack(closestHostile);
            }

            var repairTargets = creep.room.find(FIND_STRUCTURES, {
                filter: object => object.hits < object.hitsMax
            });
            repairTargets.sort((a,b) => a.hits - b.hits);
            if (repairTargets) {
                towers[i].repair(repairTargets[0]);
            }
        }
    }
}

// Spawns creeps if under specific amount.
function makeCreeps(kind, amount, body) {
    var currentCreeps = _.filter(Game.creeps, (creep) => creep.memory.role == kind);
    if (currentCreeps.length < amount) {
        var newName = kind + '_' + Game.time.toString();
        console.log('Spawning new ' + kind + ': ' + newName);
        Game.spawns['spawn_1'].spawnCreep(body, newName,
            {memory: {role: kind}});
    }
}