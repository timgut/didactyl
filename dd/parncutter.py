#!/usr/bin/env python
__author__ = 'David Randolph'
# Copyright (c) 2014 David A. Randolph.
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

# File: parncutter.py
# Purpose: Translate Parncutt abc corpus into a file suitable for finger6.c.
import music21
import imp
import numpy
corpus = imp.load_source('Corpus', 'dactyler/corpus.py')

corpus_path = "corpora/parncutt.abc"
corp = corpus.Corpus(corpus_path)
scores = corp.get_score_list()
option = '1'
option2 = '0'
fingering_count = '25'
score_count = 0
score_strings = []
for score in scores:
    score_count += 1
    score_str = ''
    note_count = 0
    note_str = ''
    for n in score[1].getElementsByClass(music21.note.Note):
        note_count += 1
        note_str += " " + str(n.midi)
    score_str = "{0} {1} {2} {3}".format(
        note_count, note_str, option, fingering_count)
    score_strings.append(score_str)

header = "{0} {1}".format(score_count, fingering_count)

print header + "\n"
print "\n".join(score_strings)
print "\n" + option2
