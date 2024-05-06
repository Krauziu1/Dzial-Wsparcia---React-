Projekt działu wsparcia z podstawowymi funkcjonalnościami takimi jak:
-Rejestracja
-Logowanie
-Sesja
-Dodawanie zgłoszeń przez użytkowników
-Odpowiedanie na zgloszenia przez moderatorow
-Przydzielanie moderatorow do zgloszen przez administratorow

Aby aplikacja działała należy zainstalować odopwiednie moduły w folderze frontend poleceniami w terminalu np. w Visual Studio Code(crtl `):
cd frontend - aby wejsc do folderu frontend
npm install

Aby prawidło włączyć aplikację będą potrzebne dwa terminale np. w programie Visual Studio Code
Aby włączyć terminal można kliknąc crtl+` lub z górnego menu wybrać Terminal>New terminal
należy wejść do katalogu backend (cd backend) oraz uruchomić serwer npm start.
Teraz można włączyć drugie okienko terminalu, po prawej stronie należy kliknąc + koło terminala. W nowym terminalu musimy wejść do katalagu frontend (cd frontend) i znowu wpisać npm start, teraz aplikacja będzie w pełni gotowa.

Należy też pamiętać o zimportowaniu bazy danych o nazwie dzial_wsaprcia z pliku baza_danych.sql na xamppową platforme phpMyAdmin oraz aby w xampp control mieć włączone moduły Apache i MySQL.
