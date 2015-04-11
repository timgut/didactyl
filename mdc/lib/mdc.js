/**
 * Copyright (c) 2015 David A. Randolph.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS," WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 *
 * ****************************************************************************
 * Created by David Randolph on 3/7/15.
 *
 * The purpose here is to split an input ABC tune (including one or two voices)
 * into appropriate one-line fragments and to insert text fields above the
 * first-voice staves and below the second-voice staves. The user will enter
 * a string of digits 1-5, parentheses, commas, and slashes to convey
 * fingerings according to the following rules:
 *
 *     1. All black note heads (including grace notes) may be assigned either
 *        a single finger number or, if ornamented, a series of finger numbers,
 *        enclosed in parentheses.
 *
 *     2. An ornamented note may either be fully fingered in parentheses, or
 *        any repeated finger patterns may be omitted. For example, a trilled
 *        note may be annotated equivalently as
 *
 *            (12121212121)
 *
 *        or
 *
 *            (121)
 *
 *     3. A slash should be used to indicate fingering variations for repeated
 *        sections of music. For example, if the thumb and middle finger are used
 *        to begin the first time through, but index and ring fingers the second time,
 *        it might look like this:
 *
 *            1/23/41234
 *
 *     4. All chord fingerings should be entered from low to high (left to right).
 *
 *     5. A comma is used to indicate that a different finger is used to release
 *        the key from the one that struck it.
 *
 *     6. All notes in a tied sequence must have a fingering assigned.
 *
 *     7. Finger shifts within an ornamented note (slashes within parentheses)
 *        are not allowed.
 *
 * Output preferences may be specified via the prefs argument to the load_collector()
 * function. The following flags are available:
 *
 *     note --> Where to position fingering annotations next to full (non-grace) notes.
 *
 *              above: above the note head
 *              below: (default) below the note
 *              right: to the right
 *              finger: wherever the ABC fingering annotation goes
 *                      In abcjs, this is a smaller number rather far above the note.
 *
 *     staff --> Render in a grand staff or a more spacious split staff
 *
 *               grand: use a series of grand staves
 *               split: (default) use separate staves, each with its own renderer
 *
 *     ornament --> Where to position (longer) ornamented note annotations.
 *
 *                  above: (default) above the note
 *                  below: below the note
 *                  right: to the right of the note
 *                  hide: suppress annotations for ornamented notes
 *
 *     shift --> How to display a fingering that changes during the sounding of
 *               a note (i.e., when a different finger releases a key from the one
 *               that struck it). Note that this setting is ignored if "note" is set
 *               to "finger." In this case, only the striking finger will be displayed.
 *
 *               parentheses: display striking finger followed by releasing finger in
 *                            parentheses, e.g., 3(1).
 *               comma: (default) display striking finger followed by comma and then
 *                      releasing finger (just as expected in fingering input)
*/
mdc_prefs = {};
abc_titles = [];
abc_header = {};
abc_headers = []; // Header for each staff (or grand staff) line.
abc_voice_lines = {}; // Array of lines for each voice.
abc_voices = [];
header_for_line = [];
ABCJS_RENDERER_SETTINGS = {scale:0.9, paddingtop:10, paddingbottom:1};

function add_voice(header_val) {
    var short_name = header_val.split(" ")[0];
    var voice_count = abc_voices.length;
    for (var i = 0; i < voice_count; i++) {
        var existing_voice = abc_voices[i];
        var existing_short_name = existing_voice.split(" ")[0];
        if (short_name === existing_short_name) {
            return existing_voice;
        }
    }
    var nm_re = /nm\s*="[^"]+"/;
    var snm_re = /snm\s*="[^"]+"/;
    var clear_voice = header_val.replace(nm_re, '');
    clear_voice = clear_voice.replace(snm_re, '');
    abc_voices.push(clear_voice);
    return clear_voice;
}

function get_voice_marker(voice_number) {
    var marker = 'V:';
    marker += abc_voices[voice_number].split(" ")[0].toString();
    marker += "\n";
    return marker;
}

function get_header_str(line_number) {
    var x_str = '';
    var t_str = '';
    var other_str = '';
    var k_str = '';
    for (var key in abc_header) {
        if (abc_header.hasOwnProperty(key)) {
            var val = abc_header[key];
            console.log('key:' + key + " " + 'val:' + val);
            if (key === 'X')
                x_str = key + ':' + val + "\n";
            else if (key === 'T' || key === 'C') {
                t_str = '';
            }
            else if (key === 'K')
                k_str = key + ':' + val + "\n";
            else if (key)
                other_str += key + ':' + val + "\n";
        }
    }
    var v_str = '';
    for (var i = 0; i < abc_voices.length; i++) {
        v_str += 'V:' + abc_voices[i] + "\n";
    }
    // v_str += "%%sysstaffsep 1cm\n";
    v_str += "%%annotationfont   Helvetica  6\n";
    var header_str = x_str; // + t_str;
    if (other_str)
        header_str += other_str;
    header_str += v_str + k_str;
    console.log("HEADER STR: >>" + header_str + "<<");
    return header_str;
}

function preprocess_abc(abc_str) {
    var lines = abc_str.split("\n");
    var len = lines.length;
    var comment_line_re = /^%/;
    var header_re = /^([BCDHKLMNOQRSTVXZ]):\s*(.*)/;
    var header_mod_re = /\[([KM]):\s*([^\]]*)/;
    var current_voice = '';
    for (var i = 0; i < len; i++) {
        var line = lines[i].trim();
        if (! line || line.match(comment_line_re)) {
            continue;
        }

        var match = header_re.exec(line)
        if (match != null) {
            var header_var = match[1]
            var header_val = match[2]
            if (header_var === 'T') {
                abc_titles.push(header_val);
            } else if (header_var === 'V') {
                current_voice = add_voice(header_val);
            } else {
                abc_header[header_var] = header_val;
            }
        } else { // not a header line or voice demarcation
            if (abc_voices.length === 0) {
                current_voice = add_voice("1");
            }
            if (abc_voice_lines[current_voice] == undefined) {
                abc_voice_lines[current_voice] = [];
            }

            console.log("Got line: " + line);
            var mods;
            header_for_line[i] = get_header_str(i);
            abc_voice_lines[current_voice].push(line);
            while (mods = header_mod_re.exec(line)) {
                var mod_var = mods[1];
                var mod_val = mods[2];
                // Inline modifications carry over to future lines and
                // therefore must be reflected in the next header used.
                abc_header[mod_var] = mod_val;
            }
        }
    }
}

function valid_finger_str(finger_str) {
    var re = /[^1-5 \(\),\/]+/;
    if (finger_str.match(re)) {
        return false;
    }
    return true;
}

function clean_fingers(finger_str) {
    var re = /[^1-5 \(\),\/]/g;
    var clean_str = finger_str.replace(re, '');
    return clean_str;
}

function get_matches(re, line) {
    var matches = [];
    var match;
    var start_index = 0;
    var end_index = 0;
    console.log("get_matches of " + re + " from >>" + line + '<<');
    while ((match = re.exec(line)) !== null) {
        end_index = re.lastIndex;
        console.log("Start: " + start_index + " End: " + end_index);
        var token_str = line.substr(start_index, end_index - start_index);
        matches.push(token_str);
        start_index = re.lastIndex;
        // console.log(match[0] + ' ' + re.lastIndex);
    }
    console.log("Match count: " + matches.length);
    return matches;
}

function tokenize(abc_line) {
    // "|:D2|EB{cd}BA B2 EB|~B2 AB dBAG|FDAD BDAD|FDAD dAFD|",
    // var re = /\{([A-Ga-g][',]*\d*)+\}|\[([A-Ga-g][',]*\d*)+\]|[A-Ga-g][',]*\d*/g;
    var re = /[\[\{]?\s*[A-Ga-g][',]*\d*\s*[}\]]?/g;
    var tokens = get_matches(re, abc_line);
    return tokens;
}

function get_finger_str(voice_number, line_number) {
    var field_name = 'finger' + voice_number.toString() + '_' + line_number.toString();
    var finger_field = document.getElementById(field_name);
    var finger_str = finger_field.value;
    if (! valid_finger_str(finger_str)) {
        // alert("Bad character.");
        finger_str = clean_fingers(finger_str);
        finger_field.value = finger_str;
    }
    return finger_str;
}

function get_finger_array(voice_number, line_number) {
    var finger_str = get_finger_str(voice_number, line_number);
    var spaceless_finger_str = finger_str.replace(/\s+/g, '');
    console.log("Fingers for voice " + voice_number + ", line " +
        line_number + ': >>' + spaceless_finger_str + '<<');
    var re = /\([12345]+\)|[12345]\/[12345]|[12345],[12345]|[12345]/g;
    var fingers = get_matches(re, spaceless_finger_str);
    return fingers;
}

function get_note_prefix() {
    var prefix = '';
    switch (mdc_prefs['note']) {
        case 'above':
            prefix = '^';
            break;
        case 'below':
            prefix = '_';
            break;
        case 'right':
            prefix = '>';
            break;
    }

    return prefix;
}

function get_fingered_ornamented_token(token, fingering, prior_prefix) {
    var clean_fingering = finger_str.replace(/^\(|\)$/g, '');

    var prefix = '';
    switch (mdc_prefs['ornament']) {
        case 'above':
            prefix = '^';
            break;
        case 'below':
            prefix = '_';
            break;
        case 'right':
            prefix = '>';
            break;
        case 'left':
            prefix = '<';
            break;
    }

    if (! prefix) {
        return token;
    }

    var fingered_token = '"' + prefix + clean_fingering + '"';
    return fingered_token;
}

function get_fingered_chord_string(notes, fingers) {
    var prefix = '^';
    var finger_str = '';
    console.log("Fingering count: " + fingers.length);
    for (var i = 0; i < fingers.length; i++) {
        finger_str += '"' + prefix + fingers[i].toString() + '"';
    }
    var note_str = notes.join('');
    var re = /(.*)(\[\s*[A-Ga-g].*)/;
    var fingered_str = note_str.replace(re, '$1' + finger_str + '$2');
    console.log("Fingered chord: " + fingered_str);
    return fingered_str;
}

function get_fingered_grace_note_string(notes, fingers) {
    var prefix = '<';
    var finger_str = '';
    if (fingers.length > 0) {
        finger_str = '"<' + fingers.join('') + '"';
        console.log("Fingas: " + finger_str);
    }

    var note_str = notes.join('');
    var re = /(.*)(\{\s*[A-Ga-g].*)/;
    var fingered_str = note_str.replace(re, '$1' + finger_str + '$2');
    console.log("Fingered GN: " + fingered_str);
    return fingered_str;
}

function get_fingered_token(token, finger) {
    var fingered_token = '';
    var prefix = get_note_prefix();

    var re = /(.*)([A-Ga-g].*)/;
    if (prefix) {
        fingered_token = token.replace(re, '$1"' + prefix + finger + '"$2');
    } else {
        fingered_token = token.replace(re, "$1" + '+' + finger + '+$2');
    }
    return fingered_token;
}

function cleanse_token(token) {
    var header_mod_re = /\[[BCDHKLMNOQRSTVXZ]:\s*[^\]]*/;
    var clean_token = token.replace(header_mod_re, '');
    clean_token = clean_token.trim();
     console.log("Dirty: >>" + token + "<< Cleansed: >>" + clean_token + '<<');
    return clean_token;
}

function closes_note_group(re, clean_token) {
    console.log("Group closer?");
    if (! re) {
        console.log("Nope, no regex.");
        return false;
    }
    console.log("Is " + re + ' in ' + clean_token + '???');
    if (clean_token.match(re)) {
        console.log("Yes, yes it is.");
        return true;
    }
    return false;
}

function get_fingered_abc_voice_line(voice_number, line_number) {
    console.log("Voice number: " + voice_number.toString());
    var voice_name = abc_voices[voice_number];
    console.log("Voice name: " + voice_name);
    var abc_str = abc_voice_lines[voice_name][line_number];
    var tokens = tokenize(abc_str);
    console.log("Processing " + tokens.length.toString() + " tokens for line " + line_number);
    var fingers = get_finger_array(voice_number, line_number);
    // console.log("How many fingers? " + fingers.count.toString());
    var fingered_str = get_voice_marker(voice_number);
    var note_spool = [];
    var finger_spool = [];
    var close_group_re = '';
    // Each token looks like this: ^[\[\{]*[A-Ga-g](.*)
    // Braces enclose grace-note groups.
    // Brackets enclose chords.
    // Any closing bracket or brace will be in the trailing gorp ($1).
    var grouper;
    var open_grouper = '';
    for (var i = 0; i < tokens.length; i++) {
        // console.log("TOKEN: >>>" + tokens[i] + '<<<');
        var clean_token = cleanse_token(tokens[i]);
        if (grouper = clean_token.match(/^([\{\[])/)) {
            open_grouper = grouper[0];
            console.log("OPEN UP WIDE: >>" + open_grouper + '<<');
            if (open_grouper === '{') {
                close_group_re = /}/;
            } else {
                close_group_re = /]/;
            }
            note_spool.push(tokens[i]);
            if (fingers[i]) {
                finger_spool.push(fingers[i]);
            }
        } else if (closes_note_group(close_group_re, clean_token)) {
            console.log("SHUT IT DOWN: " + open_grouper);
            note_spool.push(tokens[i]);
            if (fingers[i]) {
                finger_spool.push(fingers[i]);
            }
            if ("]".match(close_group_re)) {
                fingered_str += get_fingered_chord_string(note_spool, finger_spool);
            } else {
                fingered_str += get_fingered_grace_note_string(note_spool, finger_spool);
            }
            note_spool = [];
            finger_spool = [];
            close_group_re = '';
        }
        else if (close_group_re) {
            note_spool.push(tokens[i]);
            if (fingers[i]) {
                finger_spool.push(fingers[i]);
            }
        } else if (fingers[i]) {
            var fingered_token = get_fingered_token(tokens[i], fingers[i]);
            fingered_str += fingered_token;
        } else {
            fingered_str += tokens[i];
        }
    }
    fingered_str += "\n";
    return fingered_str;
}

function get_fingered_abc_line(line_number) {
    var fingered_str = get_header_str(line_number);
    for (var i = 0; i < abc_voices.length; i++) {
        fingered_str += get_fingered_abc_voice_line(i, line_number);
    }
    console.log("Fingered string: " + fingered_str);
    return fingered_str;
}

function get_split_fingered_abc_line(voice_number, line_number) {
    var fingered_str = get_header_str(line_number);
    fingered_str += get_fingered_abc_voice_line(voice_number, line_number);
    console.log("Fingered string: " + fingered_str);
    return fingered_str;
}

function render_fingered_line(line_number) {
    console.log("render_fingered_line(" + line_number + ")");
    var renderer_name = 'notation' + line_number.toString();
    var finger_str = get_fingered_abc_line(line_number);
    ABCJS.renderAbc(renderer_name, finger_str, {}, ABCJS_RENDERER_SETTINGS);
}

function render_fingered_voice_line(voice_number, line_number) {
    var renderer_name = 'notation' + voice_number.toString() +
        '_' + line_number.toString();
    var finger_str = get_split_fingered_abc_line(voice_number, line_number);
    ABCJS.renderAbc(renderer_name, finger_str, {}, ABCJS_RENDERER_SETTINGS);
}

function set_prefs(prefs) {
    switch(prefs['note']) {
        case 'above':
            break;
        case 'right':
            break;
        case 'finger':
            break;
        default:
            prefs['note'] = 'below';
    }
    mdc_prefs['note'] = prefs['note'];

    switch(prefs['ornament']) {
        case 'below':
            break;
        case 'right':
            break;
        case 'hide':
            break;
        default:
            prefs['ornament'] = 'above';
    }
    mdc_prefs['ornament'] = prefs['ornament'];

    switch(prefs['staff']) {
        case 'grand':
            break;
        default:
            prefs['staff'] = 'split';
    }
    mdc_prefs['staff'] = prefs['staff'];

    switch(prefs['shift']) {
        case 'parentheses':
            break;
        default:
            prefs['shift'] = 'comma';
    }
    mdc_prefs['shift'] = prefs['shift'];

    console.log("Output preferences");
    console.log("------------------");
    console.log("note: " + mdc_prefs['note']);
    console.log("ornament: " + mdc_prefs['ornament']);
    console.log("staff: " + mdc_prefs['staff']);
    console.log("shift: " + mdc_prefs['shift']);
}

function add_grand_staff(line_number) {
    var renderer_name = 'notation' + line_number.toString();
    var treble_field_name = 'finger0_' + line_number.toString();
    document.body.innerHTML += '<tt>RH:</tt><input onkeyup="render_fingered_line(' +
        line_number.toString() + ');" ' +
        'type="text" size="60" id="' +
        treble_field_name + '"></input><br>' + "\n";
    if (abc_voices.length > 1) {
        var bass_field_name = 'finger1_' + line_number.toString();
        document.body.innerHTML += '<tt>LH:</tt><input onkeyup="render_fingered_line(' +
            line_number.toString() + ');" ' +
            'type="text" size="60" id="' +
            bass_field_name + '"></input><br><br>';
    }
    document.body.innerHTML += '<div id="' + renderer_name + '"></div>' + "\n";
    render_fingered_line(line_number);
}

function add_split_staff(line_number) {
    var treble_renderer_name = 'notation0_' + line_number.toString();
    var bass_renderer_name = 'notation1_' + line_number.toString();
    var treble_field_name = 'finger0_' + line_number.toString();
    document.body.innerHTML += 'RH: <input onkeyup="render_fingered_voice_line(0,' +
        line_number.toString() + ');" ' +
        'type="text" size="60" id="' +
    treble_field_name + '"></input><br>' + "\n";
    if (abc_voices.length > 1) {
        var bass_field_name = 'finger1_' + line_number.toString();
        document.body.innerHTML += 'LH: <input onkeyup="render_fingered_voice_line(1,' +
        line_number.toString() + ');" ' +
        'type="text" size="60" id="' +
        bass_field_name + '"></input><br><br>';
    }
    document.body.innerHTML += '<div id="' + treble_renderer_name + '"></div>' + "\n";
    if (abc_voices.length > 1) {
        document.body.innerHTML += '<div id="' + bass_renderer_name + '"></div>' + "\n";
        render_fingered_voice_line(1, line_number);
    }
    render_fingered_voice_line(0, line_number);
}

function load_collector(abc_str, prefs) {
    console.log(abc_str);
    set_prefs(prefs);
    preprocess_abc(abc_str);

    var treble_lines = abc_voice_lines[abc_voices[0]];
    for (var i = 0; i < treble_lines.length; i++) {
        if (mdc_prefs['staff'] === 'grand') {
            add_grand_staff(i);
        } else {
            add_split_staff(i);
        }
    }

    console.log(abc_voice_lines.toString());
}

