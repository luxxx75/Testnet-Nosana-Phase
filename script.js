 
var config = {
    ScriptTitle: {
        type: 'noop',
        label: ' Crash.Bet PoChanger v1.1'
    },
    baseBet: {
        value: 100,
        type: 'balance',
        label: 'Begin bet'
    },
    warning1: {
        type: 'noop',
        label: 'Warning: Make sure to use the high bet limitation!'
    },
    stop: {
        value: 1e8,
        type: 'balance',
        label: 'stop if bet >'
    },
    poSettings: {
        type: 'noop',
        label: 'Payout Settings'
    },
    basePayout: {
        value: 2,
        type: 'multiplier',
        label: 'Begin Payout'
    },
    lossPoSettings: {
        value: 'fixPo',
        type: 'radio',
        label: 'Loss Payout Settings',
        options: {
            fixPo: {
                value: 1.99,
                type: 'multiplier',
                label: 'Loss Fix Payout'
            },
            increasePo: {
                value: 1,
                type: 'multiplier',
                label: 'Increase payout by +'
            },
            decreasePo: {
                value: 1,
                type: 'multiplier',
                label: 'Decrease payout by -'
            }
        }
    },
    lossPoSettinginfo: {
        type: 'noop',
        label: 'Increase and Decrease 1 = 0.01'
    },
    lossBetSettings: {
        value: 'fixBet',
        type: 'radio',
        label: 'Loss Bet Settings',
        options: {
            fixBet: {
                value: 2,
                type: 'multiplier',
                label: 'Fix fold Bet'
            },
            increaseBet: {
                value: 1,
                type: 'multiplier',
                label: 'Increase fold bet by +'
            },
            decreaseBet: {
                value: 1,
                type: 'multiplier',
                label: 'Decrease fold bet by -'
            }
        }
    },
    lossBetSettingsinfo: {
        type: 'noop',
        label: 'Increase and Decrease 1 = 0.01'
    },
    warning2: {
        type: 'noop',
        label: 'Warning: Please check your calculations before running!'
    },
};


log('Script is running..');

var currentBet = config.baseBet.value;
var currentPayout = config.basePayout.value
var baseFoldPo = config.lossBetSettings.options.fixBet.value;

engine.bet(roundBit(currentBet), currentPayout);
log('Begining game Bet:', currentBet / 100, 'bits, Payout', currentPayout);

engine.on('GAME_STARTING', onGameStarted);
engine.on('GAME_ENDED', onGameEnded);

function onGameStarted() {
    engine.bet(roundBit(currentBet), currentPayout);
    log('Next game Bet:', currentBet / 100, 'bits, Payout:', currentPayout)
}

function onGameEnded() {
    var lastGame = engine.history.first()

    if (!lastGame.wager) {
        return;
    }

    // Win
    if (lastGame.cashedAt) {
        currentBet = config.baseBet.value;
        currentPayout = config.basePayout.value;
        baseFoldPo = config.lossBetSettings.options.fixBet.value;
        log('Win, Next game Bet:', currentBet / 100, 'bits, Payout', currentPayout)
    } else {
        // Loss
        if (config.lossPoSettings.value === 'fixPo') {
            currentPayout = config.lossPoSettings.options.fixPo.value;
            log('Loss, Next game Payout change to', currentPayout)
            if (config.lossBetSettings.value === 'fixPo') {
                currentBet = Math.ceil(currentBet * baseFoldPo / 100) * 100;
            } else {
                if (config.lossBetSettings.value === 'increaseBet') {
                    baseFoldPo = baseFoldPo + (config.lossBetSettings.options.increaseBet.value / 100);
                    currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                } else {
                    console.assert(config.lossBetSettings.value === 'decreaseBet');
                    baseFoldPo = baseFoldPo + (config.lossBetSettings.options.decreaseBet.value / 100);
                    currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                }
            }
        } else {
            if (config.lossPoSettings.value === 'increasePo') {
                currentPayout += config.lossPoSettings.options.increasePo.value / 100;
                log('Loss, Next game Payout change to', currentPayout)
                if (config.lossBetSettings.value === 'fixPo') {
                    currentBet = Math.ceil(currentBet * baseFoldPo / 100) * 100;
                } else {
                    if (config.lossBetSettings.value === 'increaseBet') {
                        baseFoldPo = baseFoldPo + (config.lossBetSettings.options.increaseBet.value / 100);
                        currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                    } else {
                        console.assert(config.lossBetSettings.value === 'decreaseBet');
                        baseFoldPo = baseFoldPo + (config.lossBetSettings.options.decreaseBet.value / 100);
                        currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                    }
                }
            } else {
                console.assert(config.lossPoSettings.value === 'decreasePo');
                currentPayout -= config.lossPoSettings.options.decreasePo.value / 100;
                log('Loss, Next game Payout change to', currentPayout)
                if (config.lossBetSettings.value === 'fixPo') {
                    currentBet = Math.ceil(currentBet * baseFoldPo / 100) * 100;
                } else {
                    if (config.lossBetSettings.value === 'increaseBet') {
                        baseFoldPo = baseFoldPo + (config.lossBetSettings.options.increaseBet.value / 100);
                        currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                    } else {
                        console.assert(config.lossBetSettings.value === 'decreaseBet');
                        baseFoldPo = baseFoldPo + (config.lossBetSettings.options.decreaseBet.value / 100);
                        currentBet = Math.ceil((currentBet * baseFoldPo)/100)*100;
                    }
                }
            }
        }
    }


    if (currentBet > config.stop.value) {
        log(currentBet, 'Maximum amount reached, Script stopped.');
        engine.removeListener('GAME_STARTING', onGameStarted);
        engine.removeListener('GAME_ENDED', onGameEnded);
    }
}

function roundBit(bet) {
    return Math.round(bet / 100) * 100;
}
