��    R      �  m   <      �  
   �  
   �               )  T   +     �     �     �     �     �  &   �          "     7  
   D     O     b     u  *   �  '   �     �     �     	     	      9	     Z	     _	     n	     �	     �	     �	     �	     �	     �	     �	     �	     �	     �	     
     (
     8
     R
     Z
     g
  
   o
     z
     �
     �
     �
     �
     �
     �
     �
  !        -     I     a  	   n  6   x  5   �  4   �  �     ,   �     �                    ,     H  ]   W  ~   �  �   4  �        �     �                         "  "  *  
   M  
   X     c  #   h     �  _   �     �               '     <  -   P     ~     �     �     �  
   �     �     �  :   
  7   E     }     �  "   �     �     �                    )     :     M     `     f  
   r     }     �     �  !   �     �     �     �     
          )     2     :     @     I  	   `     j  %   �      �     �  ,   �       #   $     H     U  K   a  F   �  F   �  �   ;  *        3     L     T     d     t     �  l   �  r   	  �   |  �   H     &     2     D     K     W     ^     f        M           8          G   4   #   C   5   $       P   1   +      %   &       ,   -   0       N       O   6               "   .      )                2          9   <      =         K                @          Q   R      J   F   D       L   (          I   
   H   	                 *                            B            ;   /         E   !   A   7   '   ?          3       >                   :    
 - Name:  
 - Port:   Sec  sec. delay before recording 0 <span foreground="red">No Caps selected, please select one from the caps list</span> Active shortcut Alpha channel Both  [ESC + Default] Command post-recording Command pre-recording Could not load the preferences UI file Custom GStreamer Pipeline Default audio source Default only Delay Time Destination folder Display the log of Draw cursor on screencast ERROR PRE COMMAND - See logs for more info ERROR RECORDER - See logs for more info ESC only Enable keyboard shortcut Enable verbose debug Execute command after recording Execute command before recording File File container File name template File resolution Frames Per Second GStreamer Pipeline Height Left-Bottom Left-Top Margin X Margin Y No GSP description
 No Gstreamer pipeline found No WebCam recording No audio source No webcam device selected Not any Official doc Options Percentage Pixel Position Put the webcam in the corner Quality Record a selected area Record a selected monitor Record a selected window Record all desktop Recording ... / Seconds passed :  Recording status indicators Restore default options Right-Bottom Right-Top Select a desktop for recording or press [ESC] to abort Select a window for recording or press [ESC] to abort Select an area for recording or press [ESC] to abort Select the folder where the file is saved, if not specific a folder  the file will be saved in the $XDG_VIDEOS_DIR if it exists, or the home directory otherwise. Show a border around the area being recorded Show alerts and notifications Size Start Recording Start recording Start recording immediately Stop recording The extension does NOT handle the webcam and audio when you use a custom gstreamer pipeline.
 The filename which may contain some escape sequences - %d and %t will be replaced by the start date and time of the recording. These words will be replaced
 _fpath = the absolute path of the screencast video file.
_dirpath = the absolute path of destination folder for the screencast video file.
_fname = the name of the screencast video file. This option enable more debug message, to view these run this command into a terminal:
$ journalctl /usr/bin/gnome-session --since=today | grep js
$ dbus-monitor "interface=org.gnome.Shell.Screencast" Type of unit of measure Unspecified webcam WebCam WebCam Caps Width Wiki #1 Wiki #2 Project-Id-Version: 
Report-Msgid-Bugs-To: 
PO-Revision-Date: 2024-03-28 16:07+0100
Last-Translator: 
Language-Team: 
Language: de
MIME-Version: 1.0
Content-Type: text/plain; charset=UTF-8
Content-Transfer-Encoding: 8bit
Plural-Forms: nplurals=2; plural=(n != 1);
X-Generator: Poedit 3.4.2
 
 - Name:  
 - Port:   Sek  Sekunden Verzögerung vor Aufnahme 0 <span foreground="red">Keine Webcam Einstellung ausgewählt, bitte von der Liste wählen</span> Aktiver Tastenkürzel Alpha-Kanal Beide [ESC + Standard] Befehl nach Aufnahme Befehl vor Aufnahme Konnte die Einstellungen UI Datei nicht laden Angepasste GStreamer Pipeline Standard Audio-Quelle Nur Standard Verzögerungszeit Zielordner Log anzeigen von Zeige Mauszeiger in Aufnahme FEHLER PRE COMMAND - Log Dateien prüfen für mehr Details AUFNAHME FEHLER - Log Dateien prüfen für mehr Details Nur ESC Tastaturkürzel aktivieren Aktiviere ausführliches Debugging Führe Befehl nach Aufnahme aus Führe Befehl vor Aufnahme aus Datei Containerformat Dateinamenmuster Datei Auflösung Frames Pro Sekunde GStreamer Pipeline Höhe Links unten Links oben Rand X Rand Y Keine GSP Beschreibung
 Keine GStreamer Pipeline gefunden Keine Webcam Aufzeichnung Keine Audio-Quelle Keine Webcam selektiert Keine Offizielle Dokumentation Optionen Prozent Pixel Position Web-Kamera in die Ecke Qualität Einen Bereich aufnehmen Einen gewählten Bildschirm aufnehmen Ein gewähltes Fenster aufnehmen Alle Fenster aufnehmen Laufende Aufnahme / verstrichene Sekunden :  Aufnahmestatus Hinweis Standardeinstellungen zurücksetzen Rechts unten Rechts oben Wähle einen Bildschirm für die Aufnahme oder drücke [ESC] um abzubrechen Wähle ein Fenster für die Aufnahme oder drücke [ESC] um abzubrechen Wähle ein Bereich für die Aufnahme oder drücke [ESC] um abzubrechen Ordner auswählen, in dem die Aufnahme gespeichert wird. Wenn kein spezifischer Ordner gewählt wurde, wird die Datei in $XDG_VIDEOS_DIR gespeichert, sofern dies existiert, alternativ im HOME Verzeichnis. Zeige Umrandung um aufgezeichneten Bereich Zeige Benachrichtigungen Größe Starte Aufnahme Starte Aufnahme Starte Aufnahme sofort Aufnahme beenden Diese Extension verwendet weder die Webcam noch Audio wenn Sie die angepasste GStreamer Pipeline verwenden.
 Der Dateiname kann Platzhalter beinhalten - %d wird durch das Datum und %t durch die Uhrzeit der Aufnahme ersetzt. Die folgenden Wörter werden ersetzt
 _fpath = Absoluter Pfad zur Screencast Video Datei.
 _dirpath = Absoluter Pfad des Zielordners der Screencast Video Datei.
 _fname = Name der Screencast Video Datei. Diese Option aktiviert mehr Debug-Nachrichten, um diese zu sehen führen Sie diesen Befehl im Terminal aus:
$ journalctl /usr/bin/gnome-session --since=today | grep js
$ dbus-monitor "interface=org.gnome.Shell.Screencast" Maßeinheit Unbekannte Webcam Webcam Webcam Caps Breite Wiki #1 Wiki #2 