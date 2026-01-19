module.exports = {
  generateAccountCreationEmail: (email, pin) => {
    return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html dir="ltr" lang="en">
  <head>
    <meta content="width=device-width" name="viewport" />
    <link
      rel="preload"
      as="image"
      href="https://resend-attachments.s3.amazonaws.com/pMFKr6xFTs9laSe" />
    <link
      rel="preload"
      as="image"
      href="https://resend-attachments.s3.amazonaws.com/dQ28JBNrkEOV4BA" />
    <meta content="text/html; charset=UTF-8" http-equiv="Content-Type" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta content="IE=edge" http-equiv="X-UA-Compatible" />
    <meta name="x-apple-disable-message-reformatting" />
    <meta
      content="telephone=no,address=no,email=no,date=no,url=no"
      name="format-detection" />
  </head>
  <body>
    <table
      border="0"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      role="presentation"
      align="center">
      <tbody>
        <tr>
          <td>
            <table
              align="center"
              width="100%"
              border="0"
              cellpadding="0"
              cellspacing="0"
              role="presentation"
              style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;font-size:1.0769230769230769em;min-height:100%;line-height:155%">
              <tbody>
                <tr>
                  <td>
                    <table
                      align="left"
                      width="100%"
                      border="0"
                      cellpadding="0"
                      cellspacing="0"
                      role="presentation"
                      style="align:left;width:100%;padding-left:0px;padding-right:0px;line-height:155%;max-width:600px;font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif">
                      <tbody>
                        <tr>
                          <td>
                            <h2
                              style="margin:0;padding:0;font-size:1.8em;line-height:1.44em;padding-top:0.389em;font-weight:600;text-align:center">
                              <span>Account Created Successfully</span>
                            </h2>
                            <hr
                              class="divider"
                              style="width:100%;border:none;border-top:1px solid #eaeaea;padding-bottom:1em;border-width:2px" />
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:center">
                              <span>Dear User,</span>
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:center">
                              <span
                                >An MISpal account has been created with the email this has been sent to.</span
                              >
                            </p>
                            <ul
                              style="margin:0;padding:0;padding-left:1.1em;padding-bottom:1em">
                              <li
                                style="margin:0;padding:0;margin-left:1em;margin-bottom:0.3em;margin-top:0.3em">
                                <p style="margin:0;padding:0;text-align:left">
                                  <span
                                    >If this was a mistake, please contact your Principal or Administrator.</span
                                  >
                                </p>
                              </li>
                            </ul>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <span
                                >Otherwise, please see below for your account details:</span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;background-color:#efffe3;text-align:left;padding-left:1em;">
                              <span><strong>EMAIL: ${email}</strong></span>
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;background-color:#efffe3;text-align:left;padding-left:1em;">
                              <span
                                ><strong>PIN (Temporary): ${pin}</strong></span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <br />
                            </p>
                            <h3
                              style="margin:0;padding:0;font-size:1.4em;line-height:1.08em;padding-top:0.389em;font-weight:600;text-align:left">
                              <span>Getting Started with MISpal...</span>
                            </h3>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <span
                                >MISpal was designed to make everyday school administration easier. We have conducted lots of research and gathered feedback from educators. In conclusion, we have created a system that is intuitive, reliable, and easy to use. With MISpal, you can find everything organized and all in one place!</span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <br />
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <span><strong>Getting Started:</strong></span>
                              <span> Navigate to the login page using the credentials above. We recommend changing your PIN immediately. You can do this in Settings &gt; Account Management &gt; Change PIN.</span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <br />
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <span
                                >If you have any questions or need support, please contact the Principal or check our documentation.</span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:left">
                              <br />
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:center">
                              <span
                                >Thank you for using MISpal School Administration Software</span
                              >
                            </p>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;text-align:center">
                              <span>- </span
                              ><span
                                ><em
                                  ><strong
                                    ><u
                                      >Cory Kilmartin &amp; Casey Ashe (Founders)</u
                                    ></strong
                                  ></em
                                ></span
                              >
                            </p>
                            <hr
                              class="divider"
                              style="width:100%;border:none;border-top:1px solid #eaeaea;padding-bottom:1em;border-width:2px" />
                            <table
                              width="100%"
                              border="0"
                              cellpadding="0"
                              cellspacing="0"
                              role="presentation"
                              style="padding:10px 20px 10px 20px;box-sizing:border-box;padding-left:-13px">
                              <tbody>
                                <tr>
                                  <td>
                                    <table
                                      align="center"
                                      width="100%"
                                      border="0"
                                      cellpadding="0"
                                      cellspacing="0"
                                      role="presentation">
                                      <tbody style="width:100%">
                                        <tr style="width:100%">
                                          <td align="right" data-id="__react-email-column">
                                          </td>
                                        </tr>
                                      </tbody>
                                    </table>
                                    <p
                                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em;border-radius:8px;background-color:#f4f4f4;padding-left:1em;">
                                      <span>
                                        © Cirkle Development 2025 - MISpal School Administration Software</span
                                      >
                                    </p>
                                    <p
                                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                                      <span
                                        ><strong
                                          >THIS IS AN AUTOMATED EMAIL.</strong
                                        ></span
                                      >
                                    </p>
                                    <p
                                      style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                                      <span
                                        ><a
                                          href="http://mispal.cirkledevelopment.co.uk"
                                          rel="noopener noreferrer nofollow"
                                          style="color:#0670DB;text-decoration-line:none;text-decoration:underline"
                                          target="_blank"
                                          ><em
                                            >mispal.cirkledevelopment.co.uk</em
                                          ></a
                                        ></span
                                      ><span
                                        ><em>
                                          | accounts@shannoncomp.ie</em
                                        ></span
                                      >
                                    </p>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                            <p
                              style="margin:0;padding:0;font-size:1em;padding-top:0.5em;padding-bottom:0.5em">
                              <br />
                            </p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
    `;
  }
};
