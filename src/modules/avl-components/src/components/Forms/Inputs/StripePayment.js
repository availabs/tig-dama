import React from 'react';
import {Elements} from '@stripe/react-stripe-js';
import {loadStripe} from '@stripe/stripe-js';

import {CardElement, useStripe, useElements} from '@stripe/react-stripe-js';

import Alert from 'layouts/components/Alerts/Alert'

import {  STRIPE_KEY, AUTH_HOST } from 'config'

import './Stripe.css'

const NOOP = () => {}

const CheckoutForm = ({onChange=NOOP, state,name}) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (event) => {
    // Block native form submission.
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet. Make sure to disable
      // form submission until Stripe.js has loaded.
      return;
    }

    let response = await fetch(AUTH_HOST + '/campaign/secret/');
    let paymentIntent = await response.json()
    console.log('got paymentIntent', paymentIntent)
    let PAYMENT_KEY = paymentIntent.client_secret;

    const result = await stripe.confirmCardPayment(PAYMENT_KEY, {
      payment_method: {
        card: elements.getElement(CardElement)
      }
    });

    if (result.error) {
      // Show error to your customer (e.g., insufficient funds)

        onChange({type: 'error', message: result.error.message})

      console.log(result.error.message, result);
    } else {
      // The payment has been processed!
      if (result.paymentIntent.status === 'succeeded') {

        onChange({type: 'success', result})

        console.log('success' , result);
        // Show a success message to your customer
        // There's a risk of the customer closing the window before callback
        // execution. Set up a webhook or plugin to listen for the
        // payment_intent.succeeded event that handles any business critical
        // post-payment actions.
      }
    }


  };
  if(state[name].type === 'success') {
    return (<div>
        <div className="max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
              <h2 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
                Payment complete.
                <br />
                <span className="text-indigo-600">Your campaign is activated.</span>
              </h2>
            </div>
    </div>)
  }

  return (
    <form onSubmit={handleSubmit}>
      {state[name].type === 'error' ? <div className='p-3'> <Alert title='Error' text={state[name].message} /></div> : ''}
      <CardElement />
      <button
        type="submit"
        disabled={!stripe}
        className={`
          mt-4 py-2 px-4 w-full border border-transparent
          text-lg leading-5 font-medium rounded-md text-white
          bg-indigo-600 hover:bg-indigo-500
          focus:outline-none focus:border-indigo-700 focus:shadow-outline-indigo
          active:bg-indigo-700 transition duration-150 ease-in-out`
        }
      >
        Activate $99
      </button>
    </form>
  );
};
// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(STRIPE_KEY);

const App = ({state, onChange, name}) => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm state={state} onChange={onChange} name={name}/>
    </Elements>
  );
};

export default App
