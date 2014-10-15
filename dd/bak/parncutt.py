__author__ = 'David Randolph'
# Copyright (c) 2014 Tuning Bell Studios LLC
#
# Written by David A. Randolph.
#
# Permission is hereby granted, free of charge, to any person
# obtaining a copy of this software and associated documentation
# files (the "Software"), to deal in the Software without
# restriction, including without limitation the rights to use,
# copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the
# Software is furnished to do so, subject to the following
# conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
# OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
# HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
# WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
# OTHER DEALINGS IN THE SOFTWARE.

import music21
from node import GraphNode
import pprint
import time
import re

TEST_CORPUS = '/Users/w17626/dd/corpora/parncutt.abc'
THUMB = 1
INDEX = 2
MIDDLE = 3
RING = 4
LITTLE = 5

NO_MIDI = -1

WEIGHT = {
    1: 1,
    2: 1,
    3: 1,
    4: 1,
    5: 1,
    6: 1,
    7: 1,
    8: 1,
    9: 1,
    10: 1,
    11: 1,
    12: 1
}

finger_span = {
    (1, 2): {'MinPrac': -5, 'MinComf': -3, 'MinRel': 1, 'MaxRel': 5, 'MaxComf': 8, 'MaxPrac': 10},
    (1, 3): {'MinPrac': -4, 'MinComf': -2, 'MinRel': 3, 'MaxRel': 7, 'MaxComf': 10, 'MaxPrac': 12},
    (1, 4): {'MinPrac': -3, 'MinComf': -1, 'MinRel': 5, 'MaxRel': 9, 'MaxComf': 12, 'MaxPrac': 14},
    (1, 5): {'MinPrac': -1, 'MinComf': 1, 'MinRel': 7, 'MaxRel': 10, 'MaxComf': 13, 'MaxPrac': 15},
    (2, 3): {'MinPrac': 1, 'MinComf': 1, 'MinRel': 1, 'MaxRel': 2, 'MaxComf': 3, 'MaxPrac': 5},
    (2, 4): {'MinPrac': 1, 'MinComf': 1, 'MinRel': 3, 'MaxRel': 4, 'MaxComf': 5, 'MaxPrac': 7},
    (2, 5): {'MinPrac': 2, 'MinComf': 2, 'MinRel': 5, 'MaxRel': 6, 'MaxComf': 8, 'MaxPrac': 10},
    (3, 4): {'MinPrac': 1, 'MinComf': 1, 'MinRel': 1, 'MaxRel': 2, 'MaxComf': 2, 'MaxPrac': 4},
    (3, 5): {'MinPrac': 1, 'MinComf': 1, 'MinRel': 3, 'MaxRel': 4, 'MaxComf': 5, 'MaxPrac': 7},
    (4, 5): {'MinPrac': 1, 'MinComf': 1, 'MinRel': 1, 'MaxRel': 2, 'MaxComf': 3, 'MaxPrac': 5},
    (2, 1): {'MinPrac': -5, 'MinComf': -8, 'MinRel': -10, 'MaxRel': 5, 'MaxComf': 3, 'MaxPrac': -1},
    (3, 1): {'MinPrac': -7, 'MinComf': -10, 'MinRel': -12, 'MaxRel': 4, 'MaxComf': 2, 'MaxPrac': -4},
    (4, 1): {'MinPrac': -9, 'MinComf': -12, 'MinRel': -14, 'MaxRel': 3, 'MaxComf': 1, 'MaxPrac': -5},
    (5, 1): {'MinPrac': -10, 'MinComf': -13, 'MinRel': -15, 'MaxRel': 1, 'MaxComf': -1, 'MaxPrac': -7},
    (3, 2): {'MinPrac': -2, 'MinComf': -3, 'MinRel': -5, 'MaxRel': -1, 'MaxComf': -1, 'MaxPrac': -1},
    (4, 2): {'MinPrac': -4, 'MinComf': -5, 'MinRel': -7, 'MaxRel': -1, 'MaxComf': -1, 'MaxPrac': -3},
    (5, 2): {'MinPrac': -6, 'MinComf': -8, 'MinRel': -10, 'MaxRel': 2, 'MaxComf': -2, 'MaxPrac': -5},
    (4, 3): {'MinPrac': -2, 'MinComf': -2, 'MinRel': -4, 'MaxRel': -1, 'MaxComf': -1, 'MaxPrac': -1},
    (5, 3): {'MinPrac': -4, 'MinComf': -5, 'MinRel': -7, 'MaxRel': -1, 'MaxComf': -1, 'MaxPrac': -3},
    (5, 4): {'MinPrac': -2, 'MinComf': -3, 'MinRel': -5, 'MaxRel': -1, 'MaxComf': -1, 'MaxPrac': -1},
}

# print str(finger_span[(1, 2)]['MinPrac']) + "\n"

#sBach = corpus.parse('bach/bwv7.7')
#sBach.show()

# bflat = music21.note.Note("B---2")
# print bflat.accidental
# exit(0)
#print str(bflat.midi) + "\n"
#bflat.show('midi')

# ah = abcFormat.ABCHandler()
# junk = ah.process(TEST_CORPUS)
# len(ah)
#print len(corp)
#print corp[0].show('text')
#corp = converter.parse("X:1\nT:A\nC:Czerny\nM:C\nK:C\nL:1/16\n!p! egfg efde cc'bc' abga||")
# corp.show('text')
# print str(len(corp))
#print corp[0].show('text')
#print corp[1]

class FingeredNote:
    def __init__(self, note21note=None, finger=None):
        self.note21note = note21note
        self.finger = finger

    def get_midi(self):
        if self.note21note:
            return self.note21note.midi
        return None

    def get_finger(self):
        if self.finger:
            return self.finger
        return None

    def get_tuple_str(self):
        return "%s:%s" % (self.get_midi(), self.get_finger())

    def is_black_key(self):
        if not self.note21note:
            return False
        if self.note21note.accidental:
            acc = self.note21note.accidental
            if int(acc.alter) % 2 == 1:
                return True
        return False

    def is_white_key(self):
        if not self.note21note:
            return False
        return not self.is_black_key()

    def is_between(self, note_x, note_y):
        if not note_x or not note_y:
            return False

        midi = self.get_midi()
        midi_x = note_x.get_midi()
        midi_y = note_y.get_midi()

        if not midi or not midi_x or not midi_y:
            return False

        if midi > midi_x and midi < midi_y:
            return True
        if midi < midi_x and midi > midi_y:
            return True

        return False

class FingeredNoteNode(GraphNode):
    def __init__(self, fingered_note=None, terminal=None):
        GraphNode.__init__(self, terminal=terminal)
        self.fingered_note = fingered_note if fingered_note else FingeredNote()

    def dump(self, tab_count=1, recurse=True):
        #time.sleep(1)

        tab_str = ''
        for i in range(0, tab_count):
            tab_str += "\t"

        if self.is_end():
            print tab_str + " END"
            return

        if self.is_start():
            print tab_str + " START" +\
                  " Kids: " + str(len(self.next_nodes))
            tab_count += 1
            for node in self.next_nodes:
                node.dump(tab_count)
            return

        print tab_str +\
              " MIDI: " + str(self.fingered_note.get_midi()) +\
              " Finger: " + str(self.fingered_note.get_finger()) +\
              " Kids: " + str(len(self.next_nodes))
        tab_count += 1

        if recurse:
            for node in self.next_nodes:
                node.dump(tab_count)

    def get_finger(self):
        if self.fingered_note:
            return self.fingered_note.get_finger()
        return None

    def get_midi(self):
        if self.fingered_note:
            return self.fingered_note.get_midi()
        return None

    def get_tuple(self):
        return self.get_midi(), self.get_finger()

    def get_tuple_str(self):
        return "%s:%s" % (self.get_midi(), self.get_finger())

    def get_paths_as_str(self):
        str = self.get_tuple_str()
        if self.is_end():
            str += "\n"
        str += ","
        for kid in self.next_nodes:
            str += kid.get_paths_as_str()
        return str

    def get_paths(self, paths=[], path_input=[]):
        path = list(path_input)
        path.append(self.get_tuple())

        for node in self.next_nodes:
            if node.is_end():
                path_to_append = list(path)
                path_to_append.append(node.get_tuple())
                paths.append(path_to_append)
            else:
                node.get_paths(paths, path)
        return paths

    def has_three_parents(self):
        if not self.prior_nodes:
            return False
        if not self.prior_nodes[0].prior_nodes:
            return False
        return True

    def can_transition_to(self, next_node):
        if self.is_start() or next_node.is_end():
            return True
        if self.is_end():
            return False

        if next_node.get_finger() == self.get_finger():
            return False  # Limitation of model.

        required_span = next_node.get_midi() - self.get_midi()
        max_prac = finger_span[(self.get_finger(), next_node.get_finger())]['MaxPrac']
        min_prac = finger_span[(self.get_finger(), next_node.get_finger())]['MinPrac']
        if min_prac <= required_span <= max_prac:
            return True
        return False

class Trigram_Node(GraphNode):
    def __init__(self, note_1=None, note_2=None, note_3=None, terminal=None):
        GraphNode.__init__(self, terminal=terminal)
        if note_1:
            self.note_1 = note_1
        else:
            self.note_1 = FingeredNote()
        if note_2:
            self.note_2 = note_2
        else:
            self.note_2 = FingeredNote()
        if note_3:
            self.note_3 = note_3
        else:
            self.note_3 = FingeredNote()

        assert isinstance(self.note_1, FingeredNote)
        assert isinstance(self.note_2, FingeredNote)
        assert isinstance(self.note_3, FingeredNote)

        self.cost = self.calculate_node_cost()

    def note_1(self):
        return self.note_1

    def note_2(self):
        return self.note_2

    def note_3(self):
        return self.note_3

    def dump(self, tab_count=0, recurse=True):
        # time.sleep(1)
        tab_str = ''
        for i in range(0, tab_count):
            tab_str += "  "
        print tab_str + self.get_key() + " Kids: " + str(len(self.next_nodes))

        tab_count += 1

        if recurse:
            for node in self.next_nodes:
                node.dump(tab_count)

    def calculate_node_cost(self):
        if self.is_start() or self.is_end():
            self.cost = 0
            return

        note_1 = self.note_1
        note_2 = self.note_2
        note_3 = self.note_3
        finger_1 = note_1.get_finger()
        finger_2 = note_2.get_finger()
        finger_3 = note_3.get_finger()
        midi_1 = int(note_1.get_midi()) if note_1.get_midi() else NO_MIDI
        midi_2 = int(note_2.get_midi())
        midi_3 = int(note_3.get_midi()) if note_3.get_midi() else NO_MIDI

        cost = 0

        if finger_1:
            semitone_diff_12 = midi_2 - midi_1
            max_comf_12 = finger_span[(finger_1, finger_2)]['MaxComf']
            min_comf_12 = finger_span[(finger_1, finger_2)]['MinComf']
            min_rel_12 = finger_span[(finger_1, finger_2)]['MinRel']
            max_rel_12 = finger_span[(finger_1, finger_2)]['MaxRel']

            # Rule 1 ("Stretch")
            if semitone_diff_12 > max_comf_12:
                cost += 2 * (semitone_diff_12 - max_comf_12) * WEIGHT[1]
            elif semitone_diff_12 < min_comf_12:
                cost += 2 * (min_comf_12 - semitone_diff_12) * WEIGHT[1]

            span_penalty = 2
            if finger_1 == THUMB or finger_2 == THUMB:
                span_penalty = 1

            # Rule 2 ("Small-Span")
            if finger_1 and semitone_diff_12 < min_rel_12:
                cost += span_penalty * (min_rel_12 - semitone_diff_12) * WEIGHT[2]

            # Rule 3 ("Large-Span")
            if finger_1 and semitone_diff_12 > max_rel_12:
                cost += span_penalty * (semitone_diff_12 - min_rel_12) * WEIGHT[3]

            # Rule 6 ("Weak-Finger")
            if finger_1 == RING or finger_1 == LITTLE:
                cost += WEIGHT[6]

            # Rule 8 ("Three-to-Four")
            if finger_1 == MIDDLE and finger_2 == RING:
                cost += WEIGHT[8]

            # Rule 9 ("Four-on-Black")
            if (finger_1 == RING and note_1.is_black_key() and finger_2 == MIDDLE and note_2.is_white_key) or \
                    (finger_1 == MIDDLE and note_1.is_white_key and finger_2 == RING and note_2.is_black_key):
                cost += WEIGHT[9]

            # Rule 12 ("Thumb-Passing")
            thumb_passing_cost = 1
            if note_1.is_black_key() != note_2.is_black_key():
                thumb_passing_cost = 3
            if (midi_1 < midi_2 and finger_2 == THUMB) or (midi_2 < midi_1 and finger_1 == THUMB):
                cost += thumb_passing_cost * WEIGHT[12]

        if finger_1 and finger_3 and finger_1 != finger_3:
            semitone_diff_13 = midi_3 - midi_1
            max_comf_13 = finger_span[(finger_1, finger_3)]['MaxComf']
            min_comf_13 = finger_span[(finger_1, finger_3)]['MinComf']
            max_prac_13 = finger_span[(finger_1, finger_3)]['MaxPrac']
            min_prac_13 = finger_span[(finger_1, finger_3)]['MinPrac']

            # Rule 4 ("Position-Change-Count)"
            if semitone_diff_13 > max_comf_13:
                if finger_2 == THUMB and \
                        note_2.is_between(note_1, note_3) and \
                                semitone_diff_13 > max_prac_13:
                    cost += 2 * WEIGHT[4]  # A "full change"
                else:
                    cost += 1 * WEIGHT[4]  # A "half change"
            elif semitone_diff_13 < min_comf_13:
                if finger_2 == THUMB and note_2.is_between(note_1, note_3) and \
                                semitone_diff_13 < min_prac_13:
                    cost += 2 * WEIGHT[4]  # A "full change"
                else:
                    cost += 1 * WEIGHT[4]  # A "half change"

            # Rule 5 ("Position-Change-Size")
            if semitone_diff_13 < min_comf_13:
                cost += (semitone_diff_13 - min_comf_13) * WEIGHT[5]
            elif semitone_diff_13 > max_comf_13:
                cost += (max_comf_13 - semitone_diff_13) * WEIGHT[5]

            # Rule 7 ("Three-Four-Five")
            hard_sequence = True
            hard_finger = MIDDLE # That is, 3.
            for finger in sorted((finger_1, finger_2, finger_3)):
                if finger != hard_finger:
                    hard_sequence = False
                hard_finger += 1
            if hard_sequence:
                cost += WEIGHT[7]

        if finger_1 and finger_2 and finger_3:
            # Rule 10 ("Thumb-on-Black")
            black_key_cost = 1
            if finger_1 and note_1.is_white_key:
                black_key_cost += 2
            if finger_3 and note_3.is_white_key:
                black_key_cost += 2
            if finger_2 == THUMB and note_2.is_black_key():
                cost += black_key_cost * WEIGHT[10]

        # Rule 11 ("Five-on-Black")
        if finger_2 == LITTLE and note_2.is_black_key():
            cost += black_key_cost * WEIGHT[11]

        self.cost = cost

    def get_cost(self):
        return self.cost

    def get_three_note_key(self, note_1, note_2, note_3):
        str_1 = note_1.get_tuple_str()
        str_2 = note_2.get_tuple_str()
        str_3 = note_3.get_tuple_str()
        key = "%s,%s,%s" % (str_1, str_2, str_3)
        return key

    def get_key(self):
        return self.get_three_note_key(self.note_1, self.note_2, self.note_3)

    def build(self, fnn, fnn_path_input=[], trigram_layers=[], trigram_layer_index=0):
        assert isinstance(fnn, FingeredNoteNode)
        if not trigram_layers:
            parent_key = self.get_key()
            trigram_layers.append({parent_key: self})

        # print "Trigram layers: %s" % trigram_layer_index
        # pprint.pprint(trigram_layers[trigram_layer_index])
        # time.sleep(1)
        fnn_path = list(fnn_path_input)
        fnn_path.append(fnn)
        trigram_node = self
        if len(fnn_path) > 2:
            note_1 = fnn_path[-3].fingered_note
            note_2 = fnn_path[-2].fingered_note
            note_3 = fnn_path[-1].fingered_note
            trigram_key = self.get_three_note_key(note_1, note_2, note_3)
            trigram_layer_index += 1
            if trigram_layer_index < len(trigram_layers) and trigram_key in trigram_layers[trigram_layer_index]:
                trigram_node = trigram_layers[trigram_layer_index][trigram_key]
                nodes_in_layer = len(trigram_layers[trigram_layer_index])
                print "INDEX: %s(%s) REUSE node: %s" % (trigram_layer_index, nodes_in_layer, trigram_key)
            else:
                trigram_node = Trigram_Node(note_1, note_2, note_3)
                if trigram_layer_index < len(trigram_layers):
                    trigram_layers[trigram_layer_index][trigram_key] = trigram_node
                    nodes_in_layer = len(trigram_layers[trigram_layer_index])
                    print "INDEX: %s(%s) NEW  node: %s" % (trigram_layer_index, nodes_in_layer, trigram_key)
                else:
                    trigram_layers.append({trigram_key: trigram_node})
                    nodes_in_layer = len(trigram_layers[trigram_layer_index])
                    print "INDEX: %s(%s) NEW  node: %s on new layer" % (trigram_layer_index, nodes_in_layer, trigram_key)
            self.connect_to(trigram_node)

        if fnn.next_nodes:
            # print "KIDS: %s" % len(fnn.next_nodes)
            for kid in fnn.next_nodes:
                trigram_node.build(kid, fnn_path, trigram_layers, trigram_layer_index)
        else:
            trigram_layer_index += 1
            terminal_node = Trigram_Node(terminal=GraphNode.END)
            terminal_key = terminal_node.get_key()
            if trigram_layer_index < len(trigram_layers) and terminal_key in trigram_layers[trigram_layer_index]:
                terminal_node = trigram_layers[trigram_layer_index][terminal_key]
                nodes_in_layer = len(trigram_layers[trigram_layer_index])
                print "INDEX: %s(%s) REUSE node: %s" % (trigram_layer_index, nodes_in_layer, terminal_key)
            else:
                if trigram_layer_index < len(trigram_layers):
                    trigram_layers[trigram_layer_index][terminal_key] = terminal_node
                    nodes_in_layer = len(trigram_layers[trigram_layer_index])
                    print "INDEX: %s(%s) Reuse node: %s" % (trigram_layer_index, nodes_in_layer, terminal_key)
                else:
                    trigram_layers.append({terminal_key: terminal_node})
                    nodes_in_layer = len(trigram_layers[trigram_layer_index])
                    print "INDEX: %s(%s) NEW   node: %s on new layer" % (trigram_layer_index, nodes_in_layer, terminal_key)
            trigram_node.connect_to(terminal_node)


corp = music21.converter.parse(TEST_CORPUS)
fnn_graphs = {}
for score in corp:
    print score
    meta = score[0]
    print "Title: " + meta.title
    start_node = FingeredNoteNode(terminal=GraphNode.START)
    fnn_graphs[meta.title] = start_node
    parent_nodes = [start_node]
    for n in score[1].getElementsByClass(music21.note.Note):
        print str(n.midi)
        trellis_nodes = []
        is_in_next_column = {}
        for f in (THUMB, INDEX, MIDDLE, RING, LITTLE):
            fn = FingeredNote(n, f)
            fnn = FingeredNoteNode(fn)
            trellis_nodes.append(fnn)
            is_in_next_column[f] = False

        for parent_node in parent_nodes:
            childless = True
            for trellis_node in trellis_nodes:
                if parent_node.connect_to(trellis_node):
                    is_in_next_column[trellis_node.fingered_note.finger] = True
                    childless = False
            if childless:
                parent_node.disconnect()

        new_parent_nodes = []
        for trellis_node in trellis_nodes:
            if is_in_next_column[trellis_node.fingered_note.finger]:
                new_parent_nodes.append(trellis_node)

        parent_nodes = new_parent_nodes

    end_node = FingeredNoteNode(terminal=GraphNode.END)
    for parent_node in parent_nodes:
        parent_node.connect_to(end_node)

trigram_graphs = []
# print str(fnn_graphs)
for fnn_graph in sorted(fnn_graphs):
    paths = fnn_graphs[fnn_graph].get_paths()
    for path in paths:
        print path
    print "There are %s distinct paths." % len(paths)
    trigram_graph = Trigram_Node(terminal=GraphNode.START)
    trigram_graph.build(fnn_graphs[fnn_graph])
    trigram_graph.dump()
    # paths = trigram_graph.get_paths()
    break

exit(0)
