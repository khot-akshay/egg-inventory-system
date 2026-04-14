// ** React Imports
import { useRef, useEffect, Ref, ReactNode } from 'react'

// ** MUI Imports
import Box from '@mui/material/Box'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Third Party Components
import PerfectScrollbarComponent, { ScrollBarProps } from 'react-perfect-scrollbar'

// ** Custom Components Imports
import CustomAvatar from 'src/@core/components/mui/avatar'

// ** Utils Imports
import { getInitials } from 'src/@core/utils/get-initials'
import { useAuth } from 'src/hooks/useAuth'
// ** Types Imports
import {
  ChatLogType,
  MessageType,
  MsgFeedbackType,
  ChatLogChatType,
  MessageGroupType,
  FormattedChatsType
} from 'src/types/apps/chatTypes'
import React from 'react'

const PerfectScrollbar = styled(PerfectScrollbarComponent)<ScrollBarProps & { ref: Ref<unknown> }>(({ theme }) => ({
  padding: theme.spacing(5)
}))

const ChatLog = (props: ChatLogType) => {
  // ** Props
  const { data, hidden } = props
  const auth = useAuth()
  // ** Ref
  const chatArea = useRef(null)

  // ** Scroll to chat bottom
  const scrollToBottom = () => {
    if (chatArea.current) {
      if (hidden) {
        // @ts-ignore
        chatArea.current.scrollTop = Number.MAX_SAFE_INTEGER
      } else {
        // @ts-ignore
        chatArea.current._container.scrollTop = Number.MAX_SAFE_INTEGER
      }
    }

  }

  // ** Formats chat data based on sender
  const formattedChatData = () => {
    let chatLog: MessageType[] | [] = []
    if (data.chat) {
      chatLog = data.chat.chat
    }
    const formattedChatLog: FormattedChatsType[] = []
    let chatMessageSenderId = chatLog[0] ? chatLog[0].senderId : 11
    let msgGroup: MessageGroupType = {
      senderId: chatMessageSenderId,
      messages: []
    }
    chatLog.forEach((msg: MessageType, index: number) => {
      if (chatMessageSenderId === msg.senderId) {
        msgGroup.messages.push({
          time: msg.time,
          msg: msg.message,
          feedback: msg.feedback
        })
      } else {
        chatMessageSenderId = msg.senderId

        formattedChatLog.push(msgGroup)
        msgGroup = {
          senderId: msg.senderId,
          messages: [
            {
              time: msg.time,
              msg: msg.message,
              feedback: msg.feedback
            }
          ]
        }
      }

      if (index === chatLog.length - 1) formattedChatLog.push(msgGroup)
    })

    return formattedChatLog
  }


  useEffect(() => {
    // if (data && data.chats && data.chats.length) {
      scrollToBottom()
    // }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  // ** Renders user chat
  const renderChats = () => {
    return data?.chats && data?.chats?.data?.reverse().map((item: FormattedChatsType, index: number) => {
      const isSender = item?.message_type !== "received"
      // const time = new Date(item?.createdAt?.seconds)
      const time = new Date(item?.createdAt).toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

      return (
        <Box
          key={index}
          sx={{
            display: 'flex',
            flexDirection: !isSender ? 'row' : 'row-reverse',
            mb: index !== formattedChatData().length - 1 ? 4 : undefined
          }}
        >
          {/* <div>
            <CustomAvatar
              skin='light'
              color={data.contact.avatarColor ? data.contact.avatarColor : undefined}
              sx={{
                width: '2rem',
                height: '2rem',
                fontSize: '0.875rem',
                ml: isSender ? 3.5 : undefined,
                mr: !isSender ? 3.5 : undefined
              }}
              {...(data.contact.avatar && !isSender
                ? {
                    src: data.contact.avatar,
                    alt: data.contact.fullName
                  }
                : {})}
              {...(isSender
                ? {
                    src: data.userContact.avatar,
                    alt: data.userContact.fullName
                  }
                : {})}
            >
              {data.contact.avatarColor ? getInitials(data.contact.fullName) : null}
            </CustomAvatar>
          </div> */}

          <Box className='chat-body' sx={{ maxWidth: ['calc(100% - 5.75rem)', '75%', '65%'] }}>
            <Box key={index} sx={{ '&:not(:last-of-type)': { mb: 3.5 } }}>
              <div>
                <Typography
                  sx={{
                    boxShadow: 1,
                    borderRadius: 1,
                    width: 'fit-content',
                    fontSize: '0.875rem',
                    p: theme => theme.spacing(3, 4),
                    ml: isSender ? 'auto' : undefined,
                    borderTopLeftRadius: !isSender ? 0 : undefined,
                    borderTopRightRadius: isSender ? 0 : undefined,
                    color: isSender ? 'common.white' : 'text.primary',
                    backgroundColor: isSender ? 'primary.main' : 'background.paper'
                  }}
                >
                  {item.payload?.is_replied && item.payload?.reply?.text && (
                    <div style={{
                      borderLeft: '2px solid #3598DB',
                      backgroundColor: '#3598DB36',
                      padding: '2px',
                      width: '50%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>{item.payload.reply.text}</div>
                  )}
                  {item?.payload?.text?.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index !== item.payload.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Typography>
              </div>
              {index + 1 === length ? (
                <Box
                  sx={{
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isSender ? 'flex-end' : 'flex-start'
                  }}
                >

                  {item.payload.text.split('\n').map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      {index !== item.payload.text.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : null}
              <Typography variant='caption'>
                {time}
              </Typography>
            </Box>
          </Box>
        </Box>
      )
    })
  }

  const ScrollWrapper = ({ children }: { children: ReactNode }) => {
    if (hidden) {
      return (
        <Box ref={chatArea} sx={{ p: 5, height: '100%', overflowY: 'auto', overflowX: 'hidden' }}>
          {children}
        </Box>
      )
    } else {
      return (
        <PerfectScrollbar ref={chatArea} options={{ wheelPropagation: false }}>
          {children}
        </PerfectScrollbar>
      )
    }
  }

  return (
    <Box sx={{ height: 'calc(100% - 8.4375rem)' }}>
      <ScrollWrapper>{renderChats()}</ScrollWrapper>
    </Box>
  )
}

export default ChatLog
