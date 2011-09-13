// original: https://github.com/brokenseal/pony
;(function(__global__, undefined){
	var
        Broker= function(settings){
			var
				instance= this
			;

			// allow instantiation without the new keyword
			if( !( this instanceof Broker ) ) {
				return new Broker(settings);
			}

			// private attribute, accessible only from the settings method
			this.settings= mergeWithDefaultSettings(settings || {});

			if(this.settings.queueMessages === true) {
				this.messageQueue= {};
			}

			this.subscriptionList= {};
			this.subscriptionQueue= {};
			this.subscribersTokenIndex= {};
			this.messageSubscriptionTokenIndex= {};

			if(this.settings.clearMessageQueueEvery) {
				this.startClearingMessageQueue();
			}

			return this;
		}

		// private shared variables
		,messageQueueObjectId= 0
		,subscriptionToken= 0

        /**
         *
         * @param object {
         *      instance
         *      message
         *      data
         *      synchronousPublish
         *      subscribers
         * }
         * @param callback
         */
		,publish= function(kwargs){
			var
				messageQueue
                ,instance= kwargs.instance
                ,message= kwargs.message
                ,data= kwargs.data
                ,synchronousPublish= kwargs.synchronousPublish
                ,subscribers= kwargs.subscribers

				,publicationObject
				,returnValues= []
				,subscribersLen
                ,callbackQueue= []
                ,len
                ,i
				,throwException= function(exception){
					throw exception;
				}
                ,deliveredMessageCount= 0
				,deliverMessage= function(subscriber, data){
					var
						returnValue
					;

					try {
						returnValue= subscriber.apply(context, data);
					} catch(e) {
						setTimeout(throwException, 0, e);
						return;
					} finally {
                        deliveredMessageCount+= 1;
                    }

					if(synchronousPublish) {
						returnValues.push(returnValue);
					} else if(instance.settings.queueMessages === true && publicationObject) {
						publicationObject.returnValues.push(returnValue);

                        if(deliveredMessageCount == subscribers.length && callbackQueue.length !== 0) {
                            for(i= 0, len= callbackQueue.length; i < len; i++) {
                                callbackQueue[i](publicationObject.returnValues);
                            }
                        }
					}
				}
			;

			subscribers= subscribers || instance.subscriptionList[ message ];
			subscribersLen= subscribers.length;

			// if there are no subscribers available for this particular message,
			// return false
			if(!subscribers || !subscribers.length) {
				return false;
			}

			// if the user wants the messages to be queued
			if(instance.settings.queueMessages === true) {
				// if the message queue for this particular message does not exist yet
				if(!instance.messageQueue.hasOwnProperty(message)) {
					// create it
					instance.messageQueue[ message ]= messageQueue= [];
				} else {
					// or retrieve it
					messageQueue= instance.messageQueue[ message ];
				}

				// Publication object specification
				// create a new message queue object
				publicationObject= {
					// give it a unique id
					id: messageQueueObjectId++
					// the data supplied for this particular publication
					,data: data
					// the amount of callbacks are subscribed to this particular message, right now
					,subscriptionCount: subscribersLen
                    // an array which is filled with all the return values taken from the
					,returnValues: []
                    // a possible callback function which wil be fired after all the current subscribers will be
                    // fired
                    ,complete: function(fn){
                        callbackQueue.push(fn);
                    }
				};

				// push the current publication object on to the queue
				messageQueue.push(publicationObject);
			}

			if(synchronousPublish) {
				while(subscribersLen--) {
					// deliver message right away, synchronously
					deliverMessage(subscribers[subscribersLen], data);
				}
			} else {
				while(subscribersLen--) {
					// deliver message whenever possible, without blocking any
					// other js or the  browser UI ( http://ejohn.org/blog/how-javascript-timers-work/ )
					setTimeout(deliverMessage, 0, subscribers[subscribersLen], data)
				}
			}

			if(synchronousPublish) {
				return returnValues;
			} else if(instance.settings.queueMessages === true && publicationObject) {
				return publicationObject;
			}

			return true;
		}

		,unsubscribeTokenFromInstance= function(instance, subscriptionToken ) {
			var
				tokenIndex= instance.subscribersTokenIndex[ subscriptionToken ]
				,message= instance.messageSubscriptionTokenIndex[ subscriptionToken ]
				,unsubscribedSubscriber
			;

			unsubscribedSubscriber= instance.subscriptionList[ message ].splice(tokenIndex, 1)[0]

	        if(instance.subscriptionList[ message ] === 0) {
				delete instance.subscriptionList[ message ];
			}

			delete instance.subscribersTokenIndex[ subscriptionToken ];
			delete instance.messageSubscriptionTokenIndex[ subscriptionToken ];

			return unsubscribedSubscriber;
		}
		,addSubscriberToInstance= function(instance, message, subscriber){
			// double index reference for easier unsubscriptions
			instance.subscribersTokenIndex[ subscriptionToken ]= instance.subscriptionList[ message ].push( subscriber ) - 1;
			instance.messageSubscriptionTokenIndex[ subscriptionToken ]= message;

			return subscriptionToken;
		}
		// default settings
		,defaultSettings= {
			// keep track of all the messages sent to the broker
			// if set, any subscriber which subscribe after a message has already been sent
			// will be called with this message queue as soon as it subscribes to that
			// particular message
			queueMessages: true

			// if set and queueMessages is set to true, it must be the number of
			// seconds after which the message queue will be cleared upon instantiation
			// very useful to do a garbage collection of useless messages published
			,clearMessageQueueEvery: 360 // every 5 minutes
		}

		// utility functions
		,mergeWithDefaultSettings= function(settings){
			var
				key
			;

			for(key in defaultSettings) {
				if(!(key in settings)) {
					settings[key]= defaultSettings[key];
				}
			}

			return settings;
		}
	;

	Broker.prototype= {

        // force contructor to be the Broker function
        constructor: Broker
		/**
		 *  Broker.subscribe( message [, *args ] ) -> String | Array
		 *  - message (String): the message to which all the given function will be subscribed to
		 *  - *args: any amount of functions that will be subscribed
		 *  This method subscribes all the given functions to this message and returns
		 *  a subscription token or a list of subscription tokens, with which it is possible
		 *  to unsubscribe all the functions
		**/
		,subscribe: function(message){
			var
				subscribers= Array.prototype.slice.call(arguments).slice(1)
				,subscriptionTokenList= []
				,i
				,subscribersLen
				,returnSubscriptionToken
                ,messageQueueLen
			;

			if(!this.subscriptionList.hasOwnProperty(message)) {
				this.subscriptionList[ message ]= [];
			}

			if(this.settings.queueMessages === true && this.messageQueue[ message ] && this.messageQueue[ message ].length) {
                messageQueueLen= this.messageQueue[ message ].length;
				// deliver previously published messages to new subscribers, asynchronously by default
				while(messageQueueLen--) {
					publish({
                        instance: this
                        ,message: message
                        ,subscribers: this.messageQueue[ message ][ messageQueueLen ].data
                        ,synchronousPublish: false
                        ,subscribers: subscribers
                    }, null);
				}
			}

			if(subscribers.length > 1) {
				for(i= 0, subscribersLen= subscribers.length; i < subscribersLen; i++) {
					subscriptionTokenList.push(addSubscriberToInstance(this, message, subscribers[i]));
					subscriptionToken+= 1;
				}

				return subscriptionTokenList;

			} else {
				returnSubscriptionToken= addSubscriberToInstance(this, message, subscribers[0]);
				subscriptionToken+= 1;
				return returnSubscriptionToken;
			}
		}

		/**
		 *  Broker.unsubscribe( subscriptionToken ) -> Function | Array
		 *  - token (String | Array): a subscription token or a list of subscription tokens
		 *  This method unsubscribes subscribers with the associated subscription token.
		 *  If an array of subscription token is provided, all the token will be used to unsubscribe
		 *  the subscribers.
		 *
		 *  The return value can be the unsubscribed function or an array of unsubscribed functions
		**/
		,unsubscribe: function(subscriptionToken){
			var
				subscriptionTokenLen
				,unsubscribedCallbacks
			;

			if(!subscriptionToken.length) {
				unsubscribedCallbacks= unsubscribeTokenFromInstance(this, subscriptionToken);
			} else {
				subscriptionTokenLen= subscriptionToken.length;
				unsubscribedCallbacks= [];

				while(subscriptionTokenLen--) {
					unsubscribedCallbacks.push(unsubscribeTokenFromInstance(this, subscriptionToken[ subscriptionTokenLen ]));
				}
			}

			return unsubscribedCallbacks;
		}

		/**
		 *  Broker.publish( message [, *args ] ) -> Boolean | Array | Publication object
		 *  - message (String): the message to publish on the current broker
		 *  - *args: any amount of arguments, past the message
		 *  This method publishes a particular message with any amount of data given to the function
		 *  It then returns a false boolean if no subscriber is found for this message,
		 *  it returns an Array of returned values from the subscribers called,
		 *  it returns a Publication object if a queue of messages is keps inside the broker
		 *  (please refer to the Publication object specification inside the private publish function)
		 *  or it returns  true boolean value for successfull calls
		**/
		,publish: function(message){
			var
				data= Array.prototype.slice.call(arguments).slice(1)
			;

			// TODO: callback as argument or as attribute of the passed publicationObject?

			return publish({
                instance: this
                ,message: message
                ,data: data
                ,synchronousPublish: false
            }, null);
		}

		/**
		 *  Broker.publishSync( message [, *args ] ) -> Boolean
		 *  - message (String): the message to publish on the current broker
		 *  - *args: any amount of arguments, past the message
		 *  This method publishes a particular message with any amount of data given to the function
		**/
		,publishSync: function(message){
			var
				data= Array.prototype.slice.call(arguments).slice(1)
			;

			return publish({
                instance: this
                ,message: message
                ,data: data
                ,synchronousPublish: true
            }, null);
		}

		/**
		 *  Broker.startClearingMessageQueue( ) -> Broker instance
		 *  It starts clearing message queue, based on the clearMessageQueueEvery setting
		**/
		,startClearingMessageQueue: function(){
			var
				instance= this
			;

			// if there is no interval already set
			if(!this.clearMessageQueueInterval && this.settings.clearMessageQueueEvery && this.settings.queueMessages) {
				// setup a new interval for clearing messages
				instance.clearMessageQueueInterval= setInterval(function(){
					instance.clearMessageQueue();
				}, this.settings.clearMessageQueueEvery * 1000);
			}

			return this;
		}

		/**
		 *  Broker.startClearingMessageQueue( ) -> Broker instance
		 *  It stop clearing message queue
		**/
		,stopClearingMessageQueue: function(){
			if(this.clearMessageQueueInterval) {
				clearInterval(this.clearMessageQueueInterval);
				this.clearMessageQueueInterval= null;
			}

			return this;
		}

		/**
		 *  Broker.startClearingMessageQueue( ) -> Broker instance
		 *  It clears the message queue
		**/
		,clearMessageQueue: function(){
			this.messageQueue= {};

			return this;
		}
	};
    
    broke.core.pubsub= {
        Broker: Broker
        ,broker: Broker()
    };
})(this);