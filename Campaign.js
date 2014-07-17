/*
* author: Dresha.
* version 0.0.1
*/
;(function() {
	'use strict';
	mmcore.Campaign = Campaign;

	function inArray(itemToCheck, arr) {
		var inArray = false;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] === itemToCheck) {
				inArray = true;
			}
		}
		return inArray;
	}

	/**
	 * @constructor
	 * @param {string} name Campaign name from the UI.
	 * @param {!Array.<string>} maxyboxNames Names of campaign elements from the UI.
	 * @param {string} prefix Prefix with campaign type and number, for example, mt1.
	 */

		//campaign = new mmcore.Campaign('T1Plugins', ['ElemA, ElemB'], 'mt1');
	function Campaign(name, maxyboxNames, prefix) {
		/**
		 * Campaign name.
		 * @type {string}
		 */
		this.name = name;
		/**
		 * Names of campaign elements.
		 * @type {!Array.<string>}
		 */
		this.maxyboxNames = maxyboxNames;
		/**
		 * Campaign type and number prefix.
		 * @type {string}
		 */
		this.prefix = prefix;

		this.preventDefaultRendering();
		this.preventDefaultHiding();
	}

	/** Marks the campaign elements as rendered.  */
	Campaign.prototype.preventDefaultRendering = function() {
		var states = mmcore._r_mbs;
		var maxyBoxes = this.maxyboxNames;
		var l = maxyBoxes.length;

		while(l--){
			states[maxyBoxes[l]] = 1;
		}
	};

	/** Excludes the campaign elements from arguments of `mmcore.HideMaxyboxes` when it's called. */
	Campaign.prototype.preventDefaultHiding = function() {
		mmcore.HideMaxyboxes = function() {};
	};

	/**
	 * Hides content by selector.
	 * @param {string|Array.<string>} selector CSS selector(s).
	 * @param {string=} hidingStyle Optional CSS to be applied to the selector.
	 *     If ommited, the content is hidden through absolute positioning.
	 */
	Campaign.prototype.hideContent = function(selector, hidingStyle) {
		var hidingClass;
		var hidingSelectorStyle;
		var countSelectors;
		var hidingSelectors;

		this.hidingClass = this.prefix + '-hidden-content';

		// Add Class to html
		var htmlTag = document.getElementsByTagName('html')[0];
		var htmlClass = htmlTag.getAttribute('class');

		if(htmlClass !== null && htmlClass === ''){
			htmlClass = this.hidingClass;
		}else{
			htmlClass = htmlClass + ' ' + this.hidingClass;
		}
		htmlTag.setAttribute('class', htmlClass);

		if (arguments.length < 2) {
			hidingStyle = 'left: -33554430px; position: absolute; top: -33554430px;';
		}

		hidingClass = this.hidingClass;

		// Build hide selectors
		hidingSelectors = selector.split(',');
		countSelectors = hidingSelectors.length;
		hidingSelectorStyle = '';

		while(countSelectors--){
			hidingSelectorStyle += hidingClass + ' ' + hidingSelectors[countSelectors] + '{' +
				hidingStyle +
				'}'
		}

		mmcore.AttachStyle(hidingSelectorStyle);
	};

	/** Shows the content previously hidden by `Campaign.prototype.hideContent`. */
	Campaign.prototype.showContent = function() {
		if (this.hasOwnProperty('hidingClass')) {
			var htmlTag = document.getElementsByTagName('html')[0];
			var htmlClass = htmlTag.getAttribute('class');
			if(htmlClass !== null && htmlClass === ''){
				htmlClass = htmlClass.replace(' ' + this.hidingClass, '');
				htmlTag.setAttribute('class', htmlClass);
			}
		}
	};

	/** @return {Object} */
	Campaign.prototype.getExperience = function() {
		// Assume that an own property of mmcore.GenInfo reference to a unique object.
		return mmcore.GenInfo.hasOwnProperty(this.name) ?
			mmcore.GenInfo[this.name] : null;
	};

	/** @return {boolean} */
	Campaign.prototype.hasNonDefaultExperience = function() {
		// Нужно сделать на проверку макси боксов и для Дефолта не скрывать контент
		/*
		 var experience, hasNonDefaultExperience;

		 experience = this.getExperience();
		 debugger;
		 if (!experience) {
		 return false;
		 }

		 hasNonDefaultExperience = false;

		 $.each(experience, function(elementName, variantName) {
		 if (experience.hasOwnProperty(elementName) &&
		 (variantName !== 'Default')) {
		 hasNonDefaultExperience = true;
		 return false;
		 }
		 });

		 return hasNonDefaultExperience;
		 */
	};

	/**
	 * @return {boolean}
	 * @deprecated Use hasNonDefaultExperience() instead.
	 */
	Campaign.prototype.hasMaxybox = function() {
		return this.hasNonDefaultExperience();
	};

	/**
	 * Render all or specific campaign maxyboxes.
	 * this in a variant script references to the campaign.
	 *
	 * @param {string...} If specified, only the campaign maxyboxes are rendered. Arguments that are not in campaign
	 *     maxyboxNames (passed as the second argument to the campaign constructor) are ignored.
	 */

	Campaign.prototype.renderMaxyboxes = function() {
		var campaign;
		var maxyboxNames;

		// Leave only those campaign maxybox names which match to the given maxybox names.
		maxyboxNames = this.maxyboxNames;

		if (arguments.length) {
			// Возвращает только существующие макси боксы
			//maxyboxNames = $.grep(arguments, function(maxyboxName) {
			//	return ($.inArray(maxyboxName, maxyboxNames) !== -1);
			//});
		}

		// Walk through the maxybox renderers, and render the campaign maxyboxes in the order in which they are defined in
		// the campaign mappings. You can also change the output order in campaign pages.
		campaign = this;
		var key;
		for(key in mmcore._renderers){
			if(inArray(key, maxyboxNames) && typeof mmcore._renderers[key] === 'function'){
				mmcore._renderers[key].call(campaign);
			}

		}
	};
}());