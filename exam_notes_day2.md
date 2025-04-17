## Question 1 (CUSTOMER)

[] On the customer route in the sidebar there exists a label called "/settings" this route does not exist yet. Create this settings route. This settings route will have 3 tabs[personal info, checkout details, security].

    NB! The Personal Info tab will be the default tab

1. Personal Info => Create a form that is pre populated with the users personal info. The field that the customer will be able to update must be: username, firstName, lastName, displayName, email, phoneNumber and the address info. Hint.... Form validations with zod

2. Checkout Details => For the checkout details tab; create a form where the user can set there order details.
   Then you will need to go to the checkout route which is "/checkout" and ensure that the settings data that the user have set for there checkout; is pre populate in the checkout form when ever a customer want to place an order. Hint.... Form validations with zod

   However, the fields that must not be pre populated will be the: 1. Branch, 2.Collection Method, 3. The agreed terms.

3. Security => create a form. on this form there will be 3 inputs. 1. current password, 2. New Password, 3. Confirm new Password. If the current password is wrong then the new password cant overwrite the current password. Hint.... Form validations with zod

## Question 2 (EDITOR)

[] On the Home page there is 3 tabs. New arrivals, best sellers and on sale. The create modal for the slider on the tabs already exist and is called emptyslot in other words this is a modal with an empty form. Now on each card in the tabs, each card must have there own pencil icon and there own trash bin.

1. When the pencil is clicked then a modal must open that has a form with the pre populated data of that particular unique id. On this model the editor will be able to update this id's payload(data).

2. When the trash bin is clicked a modal must open that ask the following question: Are you sure you want to delete this slide? This action cannot be undone.

   Below this question must be two buttons. [cancel] [delete].

[] For the my dashboard button in the navbar, the button must navigate to the route based oin the users role. for example. if the session user is an editor then it must go tho the editors dashboard. if its a customer then the customer must be re directed to the custome dashboard. This dashboard button will be setup for routing only for an editor a customer session.

[] After setting up the my dashboard button routing you will discover that the editor route doesn't exist yet. Setup the editor route just with a navbar that has the userbutton to allow the editor to log out of their dashboard.

[] For the Headwear, Apparel and All Collections route you will have to create a empty slot at the top of the product cards and the filter sidebar that allows an editor to upload a banner for each collection.

On this banner needs to be a pencil and a trash bin. The editor can open a modal when clicking one of the two icons. See this question [On the Home page there is 3 tabs. above] => This must be the same type of functionality.
