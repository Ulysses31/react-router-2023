import { useEffect, useState } from "react";
import { MdDarkMode, MdOutlineLightMode } from "react-icons/md";
import {
  Form,
  NavLink,
  Outlet,
  redirect,
  useLoaderData,
  useNavigation,
  useSubmit,
} from "react-router-dom";
import { createContact, getContacts } from "../contacts";

export default function Root() {
  const { contacts, q } = useLoaderData();
  const navigation = useNavigation();
  const submit = useSubmit();

  // Initialize dark mode from localstorage
  let isDrk = localStorage.getItem("isDarkMode");
  const [isDarkMode, setIsDarkMode] = useState(isDrk);

  const searching =
    navigation.location &&
    new URLSearchParams(navigation.location.search).has("q");

  useEffect(() => {
    document.getElementById("q").value = q;

    // Update localstorage after state change.
    localStorage.setItem("isDarkMode", isDarkMode);
  }, [q, isDarkMode]);

  return (
    <>
      <div id="sidebar" className={isDarkMode == "true" ? "dark-mode" : ""}>
        <h1>React Router Contacts</h1>
        <div id="searchHead">
          <Form id="search-form" role="search">
            <input
              id="q"
              className={searching ? "loading" : ""}
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
              defaultValue={q}
              onChange={(event) => {
                const isFirstSearch = q == null;
                submit(event.currentTarget.form, { replace: !isFirstSearch });
              }}
            />
            <div id="search-spinner" aria-hidden hidden={!searching} />
            <div className="sr-only" aria-live="polite"></div>
          </Form>
          <Form method="post">
            <button type="submit">New</button>
          </Form>
          <button
            type="button"
            id="darkBtn"
            onClick={() => {
              setIsDarkMode(isDarkMode == "false" ? "true" : "false");
            }}
          >
            {isDarkMode == "false" ? <MdDarkMode /> : <MdOutlineLightMode />}
          </button>
        </div>
        <nav>
          {contacts.length ? (
            <ul>
              {contacts.map((contact) => (
                <li key={contact.id}>
                  <NavLink
                    to={`/contacts/${contact.id}`}
                    className={({ isActive, isPending }) =>
                      isActive ? "active" : isPending ? "pending" : ""
                    }
                  >
                    {contact.first || contact.last ? (
                      <>
                        {contact.first} {contact.last}
                        <div>{contact.favorite ? "★" : "☆"}</div>
                      </>
                    ) : (
                      <i>No Name</i>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          ) : (
            <p>No contacts</p>
          )}
        </nav>
      </div>
      <div id="detail" className={isDarkMode == "true" ? "dark-mode" : ""}>
        <Outlet />
      </div>
    </>
  );
}

export async function loader({ request }) {
  console.log("loader executed...");

  const url = new URL(request.url);
  const q = url.searchParams.get("q");

  const contacts = await getContacts(q);
  return { contacts, q };
}

export async function action() {
  console.log("action executed...");

  const contact = await createContact();
  return redirect(`/contacts/${contact.id}/edit`);
}
