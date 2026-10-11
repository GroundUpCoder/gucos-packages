all: jsmn-example
jsmn-example: example/simple.o
	cc example/simple.o -o jsmn-example
example/simple.o: example/simple.c jsmn.h
	cc -c example/simple.c -o example/simple.o
install: all
	mkdir -p $(DESTDIR)/bin $(DESTDIR)/include
	cp jsmn-example $(DESTDIR)/bin/
	cp jsmn.h $(DESTDIR)/include/
