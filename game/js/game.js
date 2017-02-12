// Primary game file. The "gameDiv" parameter matches the div element defined in index.html

var game = new Phaser.Game(1200, 600, Phaser.AUTO, 'gameDiv');

game.global= {

    music: false,
    mute: false,

};

WebFontConfig = {

    //  'active' means all requested fonts have finished loading
    //  We set a 1 second delay before calling 'createText'.
    //  For some reason if we don't the browser cannot render the text the first time it's created.
    active: function() { game.time.events.add(Phaser.Timer.SECOND,function(){}); },

    //  The Google Fonts we want to load (specify as many as you like in the array)
    google: {
      families: ['Revalia']
    }

};
// Here we add each state.

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
//game.state.add('level1', level1State);
game.state.add('c_level1', c_level1);
game.state.add('c_level2', c_level2);
game.state.add('c_level3', c_level3);
game.state.add('c_level4', c_level4);
game.state.add('c_level5', c_level5);
game.state.add('c_level6', c_level6);
game.state.add('win', winState);
game.state.add('glossary', glossaryState);
game.state.add('select', selectorState);
game.state.add('settings',optionsState);


// Now that the states are  added, we start the game by calling the boot state.
game.state.start('boot');
