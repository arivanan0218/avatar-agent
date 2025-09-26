from dotenv import load_dotenv
import logging
import asyncio

from livekit import agents
from livekit.agents import AgentSession, Agent, RoomInputOptions, RoomOutputOptions
from livekit.plugins import (
    openai,
    cartesia,
    deepgram,
    noise_cancellation,
    silero,
    anam
)
import os

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class Assistant(Agent):
    def __init__(self) -> None:
        super().__init__(instructions="You are Rise AI, a helpful AI assistant. Provide friendly, professional customer support and assistance. Be concise, helpful, and maintain a warm, approachable tone.")

async def entrypoint(ctx: agents.JobContext):
    try:
        logger.info(f"Agent starting in room: {ctx.room.name}")
        
        # Create agent session with error handling
        session = AgentSession(
            stt=deepgram.STT(model="nova-3", language="multi"),
            llm=openai.LLM(model="gpt-4o-mini"),
            tts=cartesia.TTS(model="sonic-2", voice="f786b574-daa5-4673-aa0c-cbe3e8534c02"),
            vad=silero.VAD.load(),
        )
        
        logger.info("Agent session created successfully")
        
        # Initialize Anam AI avatar with error handling
        try:
            persona_config = anam.PersonaConfig(
                name="Rise AI Assistant",
                avatarId="edf6fdcb-acab-44b8-b974-ded72665ee26"
            )
            avatar = anam.AvatarSession(persona_config=persona_config)
            await avatar.start(session, room=ctx.room)
            logger.info("Anam AI avatar initialized successfully")
        except Exception as avatar_error:
            logger.warning(f"Failed to initialize Anam avatar: {avatar_error}")
            # Continue without avatar if it fails
        
        # Start the agent session
        await session.start(
            room=ctx.room,
            agent=Assistant(),
            room_input_options=RoomInputOptions(
                noise_cancellation=noise_cancellation.BVC(), 
            ),
            room_output_options=RoomOutputOptions(
                audio_enabled=True,  # Enable audio output
            )
        )
        
        logger.info("Agent session started successfully")
        
        # Generate initial greeting
        await session.generate_reply(
            instructions="Greet the user and offer your assistance. Speak English"
        )
        
        logger.info("Initial greeting generated")
        
    except Exception as e:
        logger.error(f"Error in agent entrypoint: {e}")
        raise


if __name__ == "__main__":
    agents.cli.run_app(agents.WorkerOptions(entrypoint_fnc=entrypoint))