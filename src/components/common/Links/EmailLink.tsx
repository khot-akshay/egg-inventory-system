import Link from 'next/link'
import React from 'react'

interface Props {
  email: string
}

export default function EmailModule({ email }: Props) {
  const visibleChars = 60; // change as needed
  const truncatedEmail =
    email.length > visibleChars
      ? `${email.slice(0, visibleChars)}...`
      : email;

  return (
    <>
      {email ? (
        <Link href={`mailto:${email}`} title={`Open ${email}`} target="_blank">
          <p
            style={{
              // overflow: 'hidden',
              // whiteSpace: 'nowrap',
              wordBreak: 'break-all',
              whiteSpace: 'normal',
             // textOverflow: 'ellipsis',
              display: 'inline-block',
              color: '#1976d2',
              cursor: 'pointer',
            }}
            title={email} // full email shown on hover
          >
            {truncatedEmail}
          </p>
        </Link>
      ) : (
        <p>NA</p>
      )}
    </>
  );
}
