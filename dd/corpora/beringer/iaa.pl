#!/usr/bin/env perl
use strict;
use Data::Dumper;

sub load_file
{
    my ($file_path) = @_;
    my %fingers;
    my $split_line = '';
    open FILE, "< $file_path" or die "bad open";
    foreach my $line (<FILE>)
    {
        next if $line =~ /^#/;
        # next if $line =~ /chromatic/;
        $line =~ s/[^\w,\\]//g;
        next if not $line;

        if ($line =~ /.+\\$/)
        {
            $line =~ s/\\$//;
            $split_line .= $line;
	    next;
        }
        elsif ($line =~ /.+,.*/)
        {
            $split_line .= $line;
            my ($fingerings, $scale) = split ',', $split_line;
            print "$file_path $scale >>>${fingerings}<<<\n";
	    $fingers{$scale} = $fingerings;
	    $split_line = '';
        }
        else
        {
            die "Kerflooey";
        }
    }
    return %fingers;
}

my %blanks = load_file('scales_blanks.txt');
my %annotator_A = load_file('scales_A.txt'); #FIXME
my %annotator_L = load_file('scales_L.txt'); #FIXME

my $x_count = 0;
my $x_match_count = 0;
my $char_count = 0;
my $char_match_count = 0;
foreach my $scale (sort keys %blanks)
{
    my @blank_char = split //, $blanks{$scale};
    my @a_char = split //, $annotator_A{$scale};
    my @l_char = split //, $annotator_L{$scale};
    print $scale, ' ', scalar(@blank_char), ' ', scalar(@a_char), ' ',
        scalar(@l_char), "\n";
   
    my $blank_line = '';
    my $l_line = '';
    my $a_line = '';
    for (my $i=0; $i < scalar(@blank_char); $i++)
    {
        my $blank_char = $blank_char[$i];
	$blank_line .= $blank_char;
        my $a_char = $a_char[$i];
        my $l_char = $l_char[$i];
	$l_line .= $l_char;
	$a_line .= $a_char;

        $char_count++ if $a_char ne 'x';;
	$x_count++ if $blank_char eq 'x' and $a_char ne 'x';
	$char_match_count++ if $l_char eq $a_char and $a_char ne 'x';
	$x_match_count++ if $blank_char eq 'x' and $l_char eq $a_char;
	if ($blank_char ne 'x' and $l_char ne $a_char)
	{
	    print "Transcription ERROR in $scale at position $i.\n";
	    print "L: $l_char A: $a_char B: $blank_char\n";
	    print "B: $blank_line\n";
	    print "L: $l_line\n";
	    print "A: $a_line\n";
	}
    }
}
print "x_count: $x_count x_match_count: $x_match_count\n";
print "char_count: $char_count char_match_count: $char_match_count\n";
#print Dumper(\%annotator_L);
