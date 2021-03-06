/// <reference path="../external.ts" />

/**
 * Load stored game controller
 */
const loadGameController = {
    
    /**  
     * The load game page 
     */
    index: function() {
        template.setNavTitle( translations.text('kaiChronicles'), '#mainMenu', true);
        template.showStatistics(false);
        views.loadView('loadGame.html').then(function() {
                
            if( !cordovaApp.isRunningApp() ) {
                // Web page environment:
                loadGameView.hideFilesList();
                loadGameView.bindFileUploaderEvents();
            }
            else {
                // Cordova app files list
                loadGameView.hideFileUpload();
                loadGameController.listGameFiles();
            }

        });
    },

    /**
     * Fill the Cordova app saved games list
     */
    listGameFiles: function() {
        loadGameView.clearFilesList();
        cordovaFS.getDirectoryFiles( function(entries) {

            // Get file names
            let fileNames : Array<string> = [];
            for(let entry of entries) {
                // There can be directories here (ex. downloaded books)
                if( entry.isFile )
                    fileNames.push( entry.name );
            }

            // The list may be unsorted:
            fileNames.sort();
            loadGameView.addFilesToList( fileNames );
            loadGameView.bindListEvents();
        });
    },

    /** 
     * Called when the selected file changes (only web)
     * @param fileToUpload The selected file
     */
    fileUploaderChanged: function(fileToUpload : Blob) {
        try {
            var reader = new FileReader();
            reader.onload = function (e) {
                loadGameController.loadGame( (<any>e.target).result );
            };
            reader.readAsText(fileToUpload);
        }
        catch(e) {
            console.log(e);
            $('#loadGame-errors').text(e.toString());
        }
    },

    /**
     * Called when a file is selected (Android only)
     */
    fileListClicked: function(fileName : string) {
        cordovaFS.loadFile( fileName , function(fileContent) {
            loadGameController.loadGame( fileContent );
        });
    },

    /**
     * Load saved game and start to play it
     * @param jsonState The saved game file content
     */
    loadGame: function(jsonState : string) {
        try {
            state.loadSaveGameJson( jsonState );
            routing.redirect('setup');
        }
        catch(e) {
            console.log(e);
            if( cordovaApp.isRunningApp() )
                alert(e.toString());
            else
                $('#loadGame-errors').text(e.toString());
        }
    },

    /**
     * Delete a saved game (Android only)
     * @param fileName The file name to delete
     */
    deleteFile: function(fileName : string) {
        cordovaFS.deleteFile(fileName, function() {
            //loadGameController.listGameFiles();
            loadGameView.removeFilenameFromList( fileName );
        });
    },

    /** Return page */
    getBackController: function() { return 'mainMenu'; }
    
};