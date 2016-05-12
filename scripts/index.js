/*
  # Payback
  Find expenses that have not been refunded.

  ## Use cases
  - Using business card for personal expenses out of convenience. Need to restore the account to proper balance.

  ## Limitations
  - Due to lack of descriptions/tagging in Citizens Bank(?), no way to know whether en expense should have been refunded or not.
  - 

  ## Features
  - Citizens CSV Export parsing

  ## Wishlist
  - Simple CSV/JSON Export parsing
*/
// (function () {
"use strict";

var data;
var credits = [];
var debits = [];
var unique;

var $tableHeaderRow = $( '#table-header-row' );
 
function handleFileSelect( evt ) {
  var file = evt.target.files[0];

  Papa.parse(file, {
    header: true,
    dynamicTyping: true,
    complete: function ( results ) {
      var datum;
      var headers;

      data = results.data;

      // console.log( 'data', data );

      for ( var i = 0; i < data.length; i++ ) {
        datum = data[i];

        if ( i === 0 ) {
          headers = Object.keys( datum );

          console.log( 'headers', headers );

          headers.forEach( function ( element, index, array ) {
            $tableHeaderRow.append( '<th>' + element + '</th>' );
          } );
        }

        if ( !!datum.Debits && !!!datum.Credits ) {
          debits.push( datum );
        } else if ( !!datum.Credits && !!!datum.Debits ) {
          credits.push( datum );
        }

        // console.log( 'datum', datum );
      }

      console.log( 'credits', credits );
      console.log( 'debits', debits );

      // http://stackoverflow.com/a/15912608/214325
      unique = debits.filter( function ( transaction ) {
        var expense = transaction.Debits;
        var paidBack = false;

        // return ( credits.indexOf( transaction ) == -1 );

        for ( var i = 0; i < credits.length; i++ ) {
          if ( expense === credits[i].Credits ) {
            paidBack = true;

            break;
          }
        }

        return !paidBack;
      } );

      console.log( 'unique', unique );
    }
  });
}

$(document).ready(function(){
  $("#csv-file").change( handleFileSelect );
});
// })();