"use client";
import React from 'react';
import NavBar from "../navBar/nav";
import Footer from "../footer/index";

const TermsAndConditions = () => {
    return (
        <>
            <NavBar />
            <main className="min-h-screen bg-white pt-32">
                <section className="py-16 lg:py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4">
                        <div className="text-center mb-12 lg:mb-16">
                            <h1 className="text-4xl lg:text-5xl font-bold text-black mb-4">
                                Laks Dent Agency – Online Booking System
                            </h1>
                            <h2 className="text-2xl lg:text-3xl font-semibold text-gray-700 mb-6">
                                Simple Terms & Conditions (Summary)
                            </h2>
                            <p className="text-lg text-gray-600">
                                Last updated: 19/11/2025
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-md border border-gray-200 p-8 lg:p-12">
                            <div className="prose prose-lg max-w-none">
                                <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: '#C3EAE7' }}>
                                    <p className="text-lg text-black leading-relaxed">
                                        By using the Laks Dent Agency online booking system (the "Platform"), you agree to these terms.
                                    </p>
                                    <p className="text-lg text-black leading-relaxed mt-2">
                                        "They" / "you" means Dental Practices and Locum Dental Nurses / Hygienists using the Platform.
                                    </p>
                                </div>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">1. Who we are</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>Laks Dent Agency runs an online Platform that connects Dental Practices with Locum Dental Nurses and Hygienists.</li>
                                        <li>Laks Dent Agency operates under Lux Dent Agency Ltd, which is the holding company.</li>
                                        <li>We do not provide dental treatment and are not the employer of the Locums (unless clearly stated in a separate contract).</li>
                                        <li>We introduce Practices and Locums and help manage bookings.</li>
                                        <li>The Client is bound by the Company's Terms and Conditions from the date and time the Client first uses our services or the Platform, including when the Client first hires or books our staff as a Locum.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">2. Using the Platform</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>You must be 18+ and legally allowed to make bookings or accept work.</li>
                                        <li>You must provide accurate information when creating an account and keep your details up to date.</li>
                                        <li>Keep your login details secure – anything done under your account is your responsibility.</li>
                                        <li>Do not use the Platform for anything illegal, dishonest, or abusive.</li>
                                    </ul>
                                    <p className="mt-4 text-gray-700 italic">
                                        We may suspend or close your account if we believe these rules are being broken.
                                    </p>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">3. Bookings</h3>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">For Practices</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>You can post shifts/roles with dates, times, location, duties, and pay rate.</li>
                                            <li>You confirm the information is correct, and that your practice is safe, hygienic, and legally compliant.</li>
                                            <li>You provide the Locum with the equipment, materials, and information needed to do the job.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">For Locums</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>You can view and accept Bookings that match your skills and availability.</li>
                                            <li>By accepting a Booking, you confirm you have the right qualifications, registration, and insurance, and you're competent to do the work.</li>
                                            <li>You agree to turn up on time, work to professional standards, and be presentable in the correct and appropriate uniform for the role.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">Confirmation</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>A Booking is confirmed when the Practice posts a shift and a Locum accepts it through the Platform.</li>
                                            <li>Any changes (date, hours, rate, duties) should be agreed by both sides and, where possible, updated on the Platform.</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">4. Fees and Payments</h3>
                                    <p className="text-gray-700 mb-4">
                                        Practices agree to pay Laks Dent Agency / Lux Dent Agency Ltd fees and the Locum's agreed rate as set out in our fee schedule or written agreement.
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        Fees are usually inclusive of VAT (if applicable).
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        We use Stripe as our secure online payment gateway. By using our services and providing your card or payment details, the Client authorises Lux Dent Agency Ltd to charge the stored payment method via Stripe for all sums due under these Terms, including:
                                    </p>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6 mb-4">
                                        <li>Fees for completed Bookings;</li>
                                        <li>Any applicable agency fees; and</li>
                                        <li>Any cancellation or no-show charges that apply.</li>
                                    </ul>
                                    <p className="text-gray-700 mb-4">
                                        For standard Clients, once a job is completed and the nurse's Electronic Time Sheet is checked and signed off by the Client, the total amount due for that Booking will be calculated and charged instantly to the Client's stored payment method via Stripe. A receipt or invoice will be issued electronically.
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        For corporate Clients or larger organisations who require nurses/Locums every day or on a very frequent basis, we may, at our discretion, agree 30-day invoice terms in writing instead of instant Stripe charging after each shift. Where such a written corporate agreement is in place, we may issue weekly or monthly invoices, and the Client must pay each invoice in full within thirty (30) days of the invoice date, using the payment details or Stripe link provided.
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        If any invoice or amount remains unpaid more than thirty (30) days after the invoice date (or any other written due date agreed with a corporate Client), the Company may:
                                    </p>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6 mb-4">
                                        <li>Apply a late payment charge of 25% of the outstanding invoice amount; and</li>
                                        <li>Apply an additional late payment charge of 5% of the outstanding invoice amount on a weekly basis until full payment is received.</li>
                                    </ul>
                                    <p className="text-gray-700 mb-4">
                                        Late or non-payment may mean we pause or stop new bookings or services, restrict access to the Platform, or take further action to recover the debt.
                                    </p>
                                    <p className="text-gray-700 mb-4">
                                        The Client is responsible for ensuring that valid payment details are provided and kept up to date, and that there are sufficient funds or available credit to cover all charges.
                                    </p>

                                    <div className="mt-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">Electronic Time Sheets and Hours</h4>
                                        <p className="text-gray-700 mb-4">
                                            The Client's manager, receptionist or dentist has a duty to check the hours worked by the Locum on the Electronic Time Sheet and sign our staff off at the end of each shift or agreed period.
                                        </p>
                                        <p className="text-gray-700 mb-4">
                                            Once the hours are checked and signed by the Client's staff, those hours are treated as final and correct ("truth") and will be used by the Company to:
                                        </p>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>Produce the Locum's payslip; and</li>
                                            <li>Calculate the amount to be charged via Stripe or included on the Client's invoice (for Clients on agreed corporate 30-day terms).</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">5. Cancellations & No-Shows</h3>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">5.1 General cancellation charges (both Locums and Practices)</h4>
                                        <p className="text-gray-700 mb-4">
                                            For both Locums and Practices, if a confirmed Booking is cancelled:
                                        </p>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li><strong>More than 48 hours before the start time:</strong> normally no cancellation charge (unless stated otherwise in a specific agreement).</li>
                                            <li><strong>Within 48 hours but more than 24 hours before the start time:</strong> a cancellation charge equal to 3 hours at the agreed hourly rate for that Booking will apply.</li>
                                            <li><strong>Within 24 hours of the start time:</strong> a cancellation charge equal to 6 hours at the agreed hourly rate for that Booking will apply.</li>
                                        </ul>
                                        <p className="text-gray-700 mt-4">
                                            For Practices, these charges will be invoiced to the Client.
                                        </p>
                                        <p className="text-gray-700">
                                            For Locums, these charges may be deducted from amounts due to the Locum or invoiced directly to the Locum.
                                        </p>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">5.2 Practice cancellations</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>If a Practice cancels a confirmed Booking within the time frames above, the relevant 3-hour or 6-hour charge will apply.</li>
                                            <li>If a Practice repeatedly cancels at short notice, we may review and possibly restrict the Practice's access to the Platform.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">5.3 Locum cancellations</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>Locums should avoid cancelling confirmed Bookings except in genuine emergencies.</li>
                                            <li>Locums must inform both the Practice and Laks Dent Agency as soon as possible (using the Platform where possible, or the contact details provided).</li>
                                            <li>If a Locum cancels a confirmed Booking within the time frames above, the relevant 3-hour or 6-hour charge may be applied as described.</li>
                                            <li>If a Locum cancels confirmed bookings more than two (2) times without good reason, we may suspend or remove the Locum from the Platform.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">5.4 No-shows</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>If a Locum does not attend a confirmed Booking and gives no notice and no good reason (a "no-show"):
                                                <ul className="list-circle pl-6 mt-2 space-y-2">
                                                    <li>A minimum charge of 6 hours at the agreed hourly rate may apply; and</li>
                                                    <li>The Locum may be suspended or removed from the Platform.</li>
                                                </ul>
                                            </li>
                                            <li>If a Practice fails to honour a confirmed Booking (for example, the clinic is closed with no warning and no notice is given), we may charge the Practice a minimum of 6 hours at the agreed hourly rate.</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">6. Responsibilities of Practices</h3>
                                    <p className="text-gray-700 mb-4">Practices agree to:</p>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>Provide a safe, hygienic workplace and follow all laws and clinical standards.</li>
                                        <li>Give the Locum clear information on duties, procedures, and health & safety.</li>
                                        <li>Hold appropriate insurance (e.g. employer's liability, public liability if required).</li>
                                        <li>Comply with employment, tax, and regulatory rules related to using Locum staff.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">7. Responsibilities of Locums</h3>
                                    <p className="text-gray-700 mb-4">Locums agree to:</p>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>Keep all professional registrations, certificates, and training up to date.</li>
                                        <li>Maintain suitable professional indemnity insurance (where required).</li>
                                        <li>Work to professional, ethical, and legal standards at all times.</li>
                                        <li>Be punctual, professional, and presentable, including wearing correct uniform and appropriate PPE as required by the Practice.</li>
                                        <li>Keep patient information confidential and follow data protection and confidentiality rules.</li>
                                        <li>Tell Laks Dent Agency promptly if there are any investigations, restrictions, or issues affecting fitness to practise.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">8. Data Protection & Privacy</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>We process personal data in line with data protection laws and our Privacy Policy.</li>
                                        <li>You must only share personal data that you are allowed to share and that is necessary.</li>
                                        <li>We take reasonable steps to keep data secure, but we cannot guarantee 100% security of any online system.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">9. Our Role and Liability</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>We act as an introducer/agency. We do not control how Locums or Practices perform their work.</li>
                                        <li>We do not guarantee that any particular Locum or Practice is suitable, available, or will meet expectations, although we take reasonable steps to check information.</li>
                                        <li>We are not responsible for:
                                            <ul className="list-circle pl-6 mt-2 space-y-2">
                                                <li>Clinical decisions or outcomes;</li>
                                                <li>Cancellations, no-shows, or disputes over performance;</li>
                                                <li>Any indirect or consequential losses (like lost profits or reputation).</li>
                                            </ul>
                                        </li>
                                    </ul>
                                    <p className="text-gray-700 mt-4">
                                        Our financial responsibility to you is limited (usually capped at the fees you have paid us over a certain period or a set amount, as described in the full Terms), except where the law does not allow us to limit liability (such as for fraud or death/personal injury caused by our negligence).
                                    </p>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">10. Ending or Suspending Use</h3>
                                    <p className="text-gray-700 mb-4">We can suspend or close your account if:</p>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6 mb-4">
                                        <li>You breach these Terms;</li>
                                        <li>Your continued use may cause harm or risk; or</li>
                                        <li>We are required to by law or a regulator.</li>
                                    </ul>
                                    <p className="text-gray-700 mb-4">
                                        You can stop using the Platform at any time, but you still need to pay any outstanding fees and honour any obligations already incurred.
                                    </p>

                                    <div className="mt-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">Locum notice to stop working</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>Locum staff must give at least two (2) weeks' written notice if they wish to stop working through Laks Dent Agency and/or must complete all Bookings already accepted.</li>
                                            <li>If a Locum fails to give two weeks' notice and does not complete existing bookings without good reason, the Company may apply a charge equal to a minimum of 6 hours at the Locum's last agreed hourly rate.</li>
                                        </ul>
                                    </div>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">11. Changes to These Terms or the Platform</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>We may update the Platform (add or remove features) and may update these Terms from time to time.</li>
                                        <li>We will show the "Last updated" date and may notify you by email or via the Platform.</li>
                                        <li>If you continue to use the Platform after changes, it means you accept the updated Terms.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">12. Temp-to-Permanent / Direct Introduction (Client and Lux Dent staff)</h3>
                                    
                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">12.1 Informing us</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>If a Client wishes to offer a permanent, fixed-term or direct engagement to a Temporary worker / Locum introduced by Laks Dent Agency / Lux Dent Agency Ltd, both the Client and the worker must inform us immediately in writing.</li>
                                            <li>This applies to offers from:
                                                <ul className="list-circle pl-6 mt-2 space-y-2">
                                                    <li>The original Client branch;</li>
                                                    <li>Any other branch within the same group; or</li>
                                                    <li>Any third party to whom the worker has been introduced through the Client.</li>
                                                </ul>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">12.2 Temp-to-perm / direct introduction fees</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>Where a Client hires or engages an introduced worker directly, a Temp-to-Perm / Direct Introduction Fee will be applied to the hirer, where they have agreed to a "temp to perm fee" / direct introduction.</li>
                                            <li>A temp-to-perm fee is enforceable unless the agency expressly agrees in writing to offer another option to the hirer.</li>
                                            <li>The hirer (Client) will have a period of 10 working days from day 1 of the worker's permanent start date to decide if the candidate is suitable for the role.</li>
                                            <li>If, within those 10 working days, the Client decides the candidate is not suitable and informs the Company in writing, the Client can avoid paying the full temp-to-perm fee, but an administration fee will apply (see Appendix 3 – Perm Fee).</li>
                                            <li>After this 10-day period, if the worker remains in post, the Client must pay the full fee for hiring our candidate, as set out in Appendix 3 – Temp-to-Perm Fee / Direct Introduction Fee Chart.</li>
                                            <li>The hirer has a duty to pay the full fee within one (1) month of the candidate's start date in order to avoid interest and late payment charges (see Appendix 3 Fee Chart and clause 4 on late payment).</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">12.3 Confidentiality of fee information and rates</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>The Fee Chart in Appendix 3 – Temp-to-Perm Fee / Direct Introduction is confidential and is only available to the head of account, practice manager, owner and director.</li>
                                            <li>It is a breach of our Terms and Conditions and data protection if any other members of staff or third parties are given access to this Fee Chart.</li>
                                            <li>It is also a breach of our Terms and Conditions and data protection if our staff disclose their pay rate, charge rate or any related fee information to anyone, including: colleagues, client staff, Lux Dent staff, our competitors, or third parties.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xl font-semibold text-black mb-3">12.4 Mandatory notification of offers</h4>
                                        <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                            <li>The Company must be informed immediately by both our staff and our Client of any job offer from:
                                                <ul className="list-circle pl-6 mt-2 space-y-2">
                                                    <li>The Client's branch;</li>
                                                    <li>Any other branch within the same group; or</li>
                                                    <li>Any third party.</li>
                                                </ul>
                                            </li>
                                            <li>Once we are informed, we will complete the necessary paperwork and submit the relevant introduction fee to the Client.</li>
                                            <li>On acceptance of our Terms and Conditions and payment of the introduction fee, we will then transfer the temp nurse to the Client.</li>
                                        </ul>
                                    </div>

                                    <div className="mb-6 p-6 rounded-lg border-2 border-red-300 bg-red-50">
                                        <h4 className="text-xl font-semibold text-red-900 mb-3">12.5 Unauthorised hiring and £4,000 penalty fee</h4>
                                        <ul className="space-y-3 text-red-900 list-disc pl-6">
                                            <li><strong>There is a Penalty Fee of £4,000 for booking or hiring any of our Nurses without our authorisation.</strong></li>
                                            <li>There is always an Introduction Fee to hire any of our Nurses, and it applies to all our temporary staff, whether employed or self-employed, including staff who:
                                                <ul className="list-circle pl-6 mt-2 space-y-2">
                                                    <li>Apply online;</li>
                                                    <li>Apply by post;</li>
                                                    <li>Are introduced verbally or non-verbally;</li>
                                                    <li>Are contacted by phone; or</li>
                                                    <li>Are introduced through any other means of communication, other branches or third parties.</li>
                                                </ul>
                                            </li>
                                            <li>Any of our staff introduced to a Client must not take any direct temporary job or be hired permanently by that Client, its other branches or associated third parties for 1 year from the later of:
                                                <ul className="list-circle pl-6 mt-2 space-y-2">
                                                    <li>The date the nurse was first introduced to the Client; or</li>
                                                    <li>The date the nurse's job with Lux Dent Agency Ltd is terminated,</li>
                                                </ul>
                                            </li>
                                        </ul>
                                        <p className="text-red-900 mt-4">
                                            unless the Client has paid the required Introduction Fee or we have agreed otherwise in writing.
                                        </p>
                                    </div>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">13. Governing Law</h3>
                                    <ul className="space-y-3 text-gray-700 list-disc pl-6">
                                        <li>These Terms are governed by the laws of England and Wales.</li>
                                        <li>Any disputes will normally be dealt with by the courts of England and Wales, subject to any mandatory local consumer laws.</li>
                                    </ul>
                                </section>

                                <section className="mb-10">
                                    <h3 className="text-2xl font-bold text-black mb-4">14. Contact</h3>
                                    <p className="text-gray-700 mb-4">If you have any questions:</p>
                                    <div className="p-6 rounded-lg" style={{ backgroundColor: '#C3EAE7' }}>
                                        <p className="text-black mb-2"><strong>Laks Dent Agency</strong> (operating under Lux Dent Agency Ltd)</p>
                                        <p className="text-black mb-2"><strong>Address:</strong> 61 Griffiths Road, Wimbledon, SW19 1ST</p>
                                        <p className="text-black mb-2"><strong>Email:</strong> <a href="mailto:info@laksdentagency.co.uk" className="text-blue-600 hover:text-blue-800 underline">info@laksdentagency.co.uk</a></p>
                                        <p className="text-black mb-2"><strong>Website:</strong> <a href="http://www.laksdentagency.co.uk" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">www.laksdentagency.co.uk</a></p>
                                        <p className="text-black"><strong>Tel:</strong> <a href="tel:07490714868" className="text-blue-600 hover:text-blue-800 underline">074 9071 4868</a></p>
                                    </div>
                                </section>

                                <div className="text-center mt-12 pt-8 border-t border-gray-300">
                                    <p className="text-gray-600 italic">
                                        By continuing to use our Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
};

export default TermsAndConditions;

