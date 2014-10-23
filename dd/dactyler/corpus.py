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
import StringIO

class Corpus:
    def __init__(self, corpus_path):
        self.corp = music21.converter.parse(corpus_path)

    def get_title(self):
        if isinstance(self.corp, music21.stream.Opus):
            score = self.corp
            meta = score[0]
            return format(meta.title)
    
    def get_score_list(self):
        scores = []
        if isinstance(self.corp, music21.stream.Opus):
            for score in self.corp:
                meta = score[0]
                self.title.write(meta.title)
                scores.append(score)
        else:
            score = self.corp
            scores.append(score)
            meta = score[0]
            #print "Title: {0}".format(meta.title)

        return scores

