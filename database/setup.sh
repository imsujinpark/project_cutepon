#!/usr/bin/env bash

if ! command -v sqlite3 &> /dev/null
then
    echo 'sqlite3 was not found, download it and istall it with:'
    echo '> wget https://www.sqlite.org/2022/sqlite-autoconf-3390400.tar.gz'
    echo '> tar -xvzf sqlite-autoconf-3390400.tar.gz'
    echo '> cd sqlite-autoconf-3390400'
    echo '> ./configure; make; make install'
    echo 'if something fails, you might want to install the package build-essential'
    echo '> sudo apt install build-essential'
    exit
fi

sqlite3 sql/data.db < sql/definition.sql
