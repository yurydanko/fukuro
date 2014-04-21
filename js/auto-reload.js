/*
 * auto-reload.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Brings AJAX to Tinyboard.
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   $config['additional_javascript'][] = 'js/settings.js';
 *   $config['additional_javascript'][] = 'js/auto-reload.js';
 *
 */

$(document).ready(function(){
	if($('div.banner').length == 0)
		return; // not index
		
	if($(".post.op").size() != 1)
		return; //not thread page
	
	var poll_interval;
	if ((settings.updateFrequency) <= 10) {
		settings.updateFrequency = 10;
	}
	var poll_accuracy = settings.updateFrequency * 1000;
	
	var poll = function() {
		$.ajax({
			url: document.location,
            data: {nocache: Math.random()},
			beforeSend: function() { $('#updateThread i').addClass('fa-spin') },
            error: function(xhr, status, error) {
                noty({
                    layout: 'topLeft',
                    type: 'warning',
                    timeout: poll_accuracy,
                    text: '<b>' + _('Соединение потеряно!') + '</b><br/>' +
                        _('Не удалось получить новые посты.')
                });
            },
			success: function(data) {
				$(data).find('div.post.reply').each(function() {
					var id = $(this).attr('id');
					if($('#' + id).length == 0) {
						$(this).insertAfter($('div.post:not(.hover):not(.post-hover):last').next()).after('<br class="clear">');
						$(document).trigger('new_post', this);
						$('#updateThread i').removeClass('fa-spin');
					}
                    if (settings.useMomentJS) {
                        now = moment();
                        momentize(document);
                    }
				});
			}
		});
		(settings.updateThread == "false") ? poll_interval = false : poll_interval = setTimeout(poll, poll_accuracy);
	};

    (settings.simpleNavbar) ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-lg"></i></a>&nbsp;') :
        (device_type == "mobile") ? $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh fa-2x"></i></a>&nbsp;') :
            $("#navigation").prepend('<a id=\"updateThread\"><i class="fa fa-refresh"></i> ' + _('Обновить') + '</a>&nbsp;');
	
	function pollNewPosts() {
		clearTimeout(poll_interval);
		poll_interval = setTimeout(poll, poll_accuracy);
	}
	
	if(settings.updateThread) {
        pollNewPosts();
	}
	
	$('#updateThread').click(function () {
		$('#updateThread i').addClass('fa-spin');
		poll_interval = setTimeout(poll, 1000);
		$(document).bind('new_post', function(e, post) {
			clearTimeout(poll_interval);
        });
	});
});

