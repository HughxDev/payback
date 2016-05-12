/*
  # Payback
  Find expenses that have not been refunded.

  ## Use cases
  - Using business card for personal expenses out of convenience. Need to restore the account to proper balance.

  ## Limitations
  1. Due to lack of descriptions/tagging in Citizens Bank, no way to know whether en expense should have been refunded or not.
  2. If you coincidentally get paid the same amount as an amount previously spent, it will not show up. 

  ## Features
  - Citizens CSV Export parsing

  ## Wishlist
  - Simple CSV/JSON Export parsing
  - To solve limitation #2, allow user to pair transactions manually to cancel them out, rather than automatically?
*/
// (function () {
"use strict";

var data;
var credits = [];
var debits = [];
var unique;

var $table = $( '#table' );
var $tableHeaderRow = $( '#table-header-row' );
var $tableBody = $( '#table-body' );
var $info = $( '#info' );
var $numDebits = $( '#num-debits' );
var $numCredits = $( '#num-credits' );
var $numUnique = $( '#num-unique' );
 
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
            $tableHeaderRow.append( '<th id="th-' + ( index + 1 ) + '">' + element + '</th>' );
          } );
        }

        if ( !!datum.Debits && !!!datum.Credits ) {
          debits.push( datum );
        } else if ( !!datum.Credits && !!!datum.Debits ) {
          credits.push( datum );
        }

        // console.log( 'datum', datum );
      }

      $numCredits.html( credits.length );
      $numDebits.html( debits.length );

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

      $numUnique.html( unique.length );

      $info.prop( 'hidden', false );

      unique.forEach( function ( debit, index, debits ) {
        var tr = document.createElement( 'tr' );

        var td;

        headers.forEach( function ( header, index, headers ) {
          td = document.createElement( 'td' );

          td.innerHTML = debit[header];

          tr.appendChild( td );
        } );

        $tableBody.append( tr );
      } ); // unique.forEach

      $table.DataTable();
    } // complete
  }); // parse
}

$(document).ready(function(){
  $( "#csv-file" ).change( handleFileSelect );
});
// })();