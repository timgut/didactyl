__author__ = 'w17626'

import music21

NOTE_CLASS_IS_BLACK = {
    0: False,
    1: True,
    2: False,
    3: True,
    4: False,
    5: False,
    6: True,
    7: False,
    8: True,
    9: False,
    10: True,
    11: False
}

def is_black(m21_note):
    if not m21_note:
        return False
    return NOTE_CLASS_IS_BLACK[m21_note.pitchClass]

def is_white(m21_note):
    if not m21_note:
        return False
    return not is_black()
