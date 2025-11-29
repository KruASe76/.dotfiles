/*!
	Extensions to the todo.txt format
*/

// eslint-disable-next-line no-unused-vars
export class TodoTxtExtension {
	constructor (name) {
		this.name = name;
	}

	reset () {
		this.name = null;
		this.parsingFunction = null;
	}
	// The parsing function should return an array containing
	// the real value of the element, the parsed task line and
	// the string representation of the value.
	// eslint-disable-next-line no-unused-vars
	parsingFunction (line) {
		return [null, null, null];
	}
}

export class HiddenExtension extends TodoTxtExtension {
	constructor() {
		super("h");
	}

	parsingFunction (line) {
		var hidden = null;
		var hiddenRegex = /\bh:1\b/;
		var matchHidden = hiddenRegex.exec( line );
		if ( matchHidden !== null ) {
			hidden = true;
		}
		return [hidden, line.replace(hiddenRegex, ''), hidden ? '1' : null];
	}
}

export class DueExtension extends TodoTxtExtension {
	constructor() {
		super("due");
	}

	parsingFunction (line) {
		var dueDate = null;
		var dueRegex = /due:([0-9]{4}-[0-9]{1,2}-[0-9]{1,2})\s*/;
		var matchDue = dueRegex.exec(line);
		if ( matchDue !== null ) {
			var datePieces = matchDue[1].split('-');
			dueDate = new Date( datePieces[0], datePieces[1] - 1, datePieces[2] );
			return [dueDate, line.replace(dueRegex, ''), matchDue[1]];
		}
		return [null, null, null];
	}
}

// Exported functions for node
(function(exports){

	exports.TodoTxtExtension = TodoTxtExtension;
	exports.HiddenExtension = HiddenExtension;
	exports.DueExtension = DueExtension;

})(typeof exports === 'undefined' ? window : exports);
