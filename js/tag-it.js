(function ($) {

    $.fn.tagit = function (options) {

        // Available options
        //   availableTags: Tags that are available for auto completion
        //   initialTags: Tags that are initially entered into the tagit list upon initialization
        //   allowSpaceInTags: Determines if spaces are allowed in tags.  If true, a tag is not created via the spacebar, and the space becomes part of the tag
        //   fieldName: Sets the name attribute of the generated input field
        //   onTagAdded: Javascript function to call when a tag is added to the list
        //   onTagRemoved: Javascript function to call when a tag is removed from the list

        var defaults = {
            availableTags: [],
            initialTags: [],
            allowSpaceInTags: false,
            fieldName: "item[Tags[]]"
        };

        var options = $.extend(defaults, options);
        var el = this;

        // Original code had these as conts, but that broke IE
        var BACKSPACE = 8;
        var ENTER = 13;
        var SPACE = 32;
        var COMMA = 44;

        // add the tagit CSS class.
        el.addClass("tagit");

        // create the input field.
        var html_input_field = "<li class=\"tagit-new\"><input class=\"tagit-input\" type=\"text\" /></li>\n";
        el.html(html_input_field);

        // Localise the variable so multiple tagit fields can exist on a single page
        var tag_input = el.children(".tagit-new").children(".tagit-input");

        // Create initial values
        for (var x = 0; x < options.initialTags.length; x++) {
            create_choice(jQuery.trim(options.initialTags[x]));
        }

        $(this).click(function (e) {
            if (e.target.tagName == 'A') {
                // Removes a tag when the little 'x' is clicked.
                // Event is binded to the UL, otherwise a new tag (LI > A) wouldn't have this event attached to it.
                $(e.target).parent().remove();

                // Call the onTagRemoved function
                if (options.onTagRemoved)
                    options.onTagRemoved();
            }
            else {
                // Sets the focus() to the input field, if the user clicks anywhere inside the UL.
                // This is needed because the input field needs to be of a small size.
                tag_input.focus();
            }
        });

        tag_input.keypress(function (event) {
            var keyCode = event.keyCode || event.which;
            if (keyCode == BACKSPACE) {
                if (tag_input.val() == "") {
                    // When backspace is pressed, the last tag is deleted.
                    $(el).children(".tagit-choice:last").remove();

                    // Call the onTagRemoved function
                    if (options.onTagRemoved)
                        options.onTagRemoved();
                }
            }
            // Comma and Enter are all valid delimiters for new tags.  Space is a valid delimeter if options.allowSpaceInTags is false
            else if (keyCode == COMMA || keyCode == ENTER || (!options.allowSpaceInTags && keyCode == SPACE)) {
                event.preventDefault();

                var typed = tag_input.val();
                typed = typed.replace(/,+$/, "");
                typed = typed.trim();

                if (typed != "") {
                    if (is_new(typed)) {
                        create_choice(typed);

                        // Call the onTagAdded function
                        if (options.onTagAdded)
                            options.onTagAdded();
                    }
                    // Cleaning the input.
                    tag_input.val("");
                }
            }
        });

        tag_input.autocomplete({
            source: options.availableTags,
            select: function (event, ui) {
                if (is_new(ui.item.value)) {
                    create_choice(ui.item.value);
                        
                    // Call the onTagAdded function
                    if (options.onTagAdded)
                        options.onTagAdded();
                }
                // Cleaning the input.
                tag_input.val("");

                // Preventing the tag input to be update with the chosen value.
                return false;
            }
        });

        function is_new(value) {
            var is_new = true;
            tag_input.parents("ul").children(".tagit-choice").each(function (i) {
                n = $(this).children("input").val();
                if (value == n) {
                    is_new = false;
                }
            })
            return is_new;
        }
        function create_choice(value) {
            var el = "";
            el = "<li class=\"tagit-choice\">\n";
            el += value + "\n";
            el += "<a class=\"close\">x</a>\n";
            el += "<input type=\"hidden\" style=\"display:none;\" value=\"" + value + "\" name=\"" + options.fieldName + "\">\n";
            el += "</li>\n";
            var li_search_tags = tag_input.parent();
            $(el).insertBefore(li_search_tags);
            tag_input.val("");
        }
    };

    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, "");
    };

})(jQuery);
