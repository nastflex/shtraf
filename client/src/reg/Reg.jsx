import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { regThunk } from '../redux/regSlice.js'
import { useLocation, useNavigate } from 'react-router-dom'

function Registration() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [nick, setNick] = useState('')

  const regState = useSelector((state) => state.reg)

  const dispatch = useDispatch()
  const path = useLocation()
  const nav = useNavigate()

  useEffect(() => {
    if (regState.message) {
      nav('/auth')
    }
  }, [regState])

  return (
    regState.loading ? <p>Загрузка...</p> :
      <>
        <div className="mainDiv">
          <form>
            <h1>Регистрация</h1>
            <input type="text" placeholder='Короткое имя (никнейм)' value={nick} onChange={e => setNick(e.target.value)} />
            <input type="text" placeholder='Телефон' value={phone} onChange={e => setPhone(e.target.value)} />
            <input type="password" placeholder='Пароль' value={password} onChange={e => setPassword(e.target.value)} />
            <button className='btn' onClick={() => {
              dispatch(regThunk({
                nick: nick,
                phone: phone,
                password: password
              }))
            }}>Зарегистрироваться</button>
          </form>
          {
            regState.error ? <p>{regState.error}</p> : <></>
          }
        </div>
      </>
  )
}

export default Registration
